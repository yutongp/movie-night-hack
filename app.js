/**
 * Module dependencies.
 */

var express = require('express')
	, routes = require('./routes')
	, user = require('./routes/user')
	, http = require('http')
	, https = require('https')
	, path = require('path')
	, async = require('async')
	, everyauth = require('everyauth')
	, api_config = require('./api_config');

var app = express();

everyauth.helpExpress(app);


var usersById = {};
var usersByFbId = {};
var nextUserId = 110;

function addUser (source, sourceUser) {
	var user;
	if (arguments.length === 1) { // password-based
		user = sourceUser = source;
		user.id = ++nextUserId;
		return usersById[nextUserId] = user;
	} else { // non-password-based
		user = usersById[++nextUserId] = {id: nextUserId};
		user[source] = sourceUser;
	}
	return user;
}


everyauth.everymodule
.findUserById( function (id, callback) {
	callback(null, usersById[id]);
});

/**
 * Social login integration using Facebook
 */
everyauth.facebook
.appId(api_config.facebook.appId)
.appSecret(api_config.facebook.appSecert)
.scope(api_config.facebook.scope)
.handleAuthCallbackError( function (req, res) {
	res.send('Error occured');
})
.findOrCreateUser( function (session, accessToken, accessTokExtra, fbUserMetadata) {
	return usersByFbId[fbUserMetadata.id] ||
        (usersByFbId[fbUserMetadata.id] = addUser('facebook', fbUserMetadata));
})
.redirectPath('/');

// all environments
app.set('port', process.env.PORT || 8080);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.set('env', 'development');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.cookieParser('secert1qaz2wsx'));
app.use(express.session());
app.use(express.csrf());
app.use(everyauth.middleware(app));
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'share')));

// development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);

var server = http.createServer(app).listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});

var io = require('socket.io').listen(server);


io.sockets.on('connection', function(socket){
	socket.on('connect', function(data){
		//call function for connect and send the socket and data
		console.log("in");
	});

	//event when a client disconnects from the app
	socket.on('disconnect', function(){
		console.log("out");
	});
	socket.on('room', function(room) {
		socket.join(room);
		io.sockets.in('foobar').emit('message', 'anyone in this room yet?');
		io.sockets.in(room).emit('message', 'what is going on, party people?');
	});

	socket.on('invitedFriends', function(id, token, friends){
		function getRelatedMoviesPerUser(id, cb) {
			async.waterfall([
				function(callback) {
					fbGraphAPI(id, 'video.watches', token, callback);
				},
				function(data, callback) {
					var moviesRTparallelArr = [];
					for (var i = 0; i < data.length; i++) {
						if (data[i].data.movie != undefined) {
							moviesRTparallelArr.push(parallelHelper(
									data[i].data.movie.title, relatedMoviesFromRT));
						}
					}
					async.parallel(moviesRTparallelArr, function(err, result) {
						cb(err, result);
					});
				}
			], function(err, result){callback(err, result);});
		}
		var userMoviesparallelArr = [];
		for (var i = 0; i < friends.length; i++) {
			userMoviesparallelArr.push(parallelHelper(friends[i].id,
						getRelatedMoviesPerUser));
		}
		console.log(userMoviesparallelArr);
		async.parallel(userMoviesparallelArr, function(err, result){
		
		});
	});
});

var parallelHelper = function(par, func) {
	return function(callback) {
		func(par, callback);
	};
};

var relatedMoviesFromRT = function(name, cb) {
	async.waterfall([
		function(callback) {
			var urlId = 'http://api.rottentomatoes.com/api/public/v1.0/movies.json?'
				+ 'apikey=' + api_config.rottentomatoes.apiKey + '&q=' + name
				+ '&page_limit=1';
			rtAPI(urlId, callback);
		},
		function(response, callback) {
			console.log("RRRRRRRRRRRRRRRRRRRRR", response);
			if (response.movies.length > 0) {
				var id = response.movies[0].id;
				var urlId = 'http://api.rottentomatoes.com/api/public/v1.0/movies/'
					+ id + '/similar.json?apikey='
					+ api_config.rottentomatoes.apiKey;
				rtAPI(urlId, callback);
			}
		},
		function(response, callback) {
			for (var i = 0; i < response.length; i++) {
				
			}
			var moviesIMDBparallelArr = [];
			for (var i = 0; i < response.length; i++) {
				moviesIMDBparallelArr.push(
					parallelHelper(response[i].alternate_ids.imdb,
					function(imdbId, callback) {
						var url = 'http://www.omdbapi.com/?i=tt' + imdbId;
						http.get(imdbId, function(res) {
							var datastring = "";
							res.on('data', function (chunk) { datastring += chunk;});
							res.on('end', function () {
								var obj = JSON.parse(datastring);
								callback(null, obj);
							});
						})
					}));
			}
			async.parallel(moviesIMDBparallelArr,
					function(err, result){callback(err, result);});
		}
	], function(err, result) {cb(err, result);});
}

var rtAPI = function (url, cb) {
	http.get(url, function (res) {
		var datastring = "";
		res.on('data', function (chunk) { datastring += chunk;});
		res.on('end', function () {
			var obj = JSON.parse(datastring);
			if (obj.error === undefined) {
				cb(null, obj);
			} else {
				setTimeout(rtAPI(url, cb), 1000);
			}
		});
	});
}

var fbGraphAPI = function (id, request, accessToken, callback) {
	var data = [];
	function fbGraphHelper(options) {
		https.get(options, function (res) {
			var datastring = "";
			res.on('data', function (chunk) { datastring += chunk;});
			res.on('end', function () {
				console.log('fb======', datastring);
				var obj = JSON.parse(datastring);
				if (obj.data.length != 0) {
					data = data.concat(obj.data);
					fbGraphHelper(obj.paging.next);
				} else {
					callback(null, data);
				}
			});
		});
	}
	fbGraphHelper({host:'graph.facebook.com',
		path:'/' + id + '/' + request + '?access_token=' + accessToken});
}

exports.io = io;
exports.fbGraphAPI = fbGraphAPI;
/**
 * Go through OAuth2 with CSRF and signed_request processing.
 */
//function authenticate(request, response, next) {
	//parseQuery(request);
	//var error = request.query.error;
	//var code = request.query.code; // authorization code
	//var received_state = request.query.state; // anti-CSRF protection
	//var signed_request = getSignedRequest(request);

	//if (error !== undefined) { // The user refused to allow access
		//var error_obj = Error(decodeURI(request.query.error_description));
		//error_obj.error_reason = request.query.error_reason;
		//error_obj.error_name = error;
		//next(error_obj);
	//} else if (signed_request !== null && signed_request['oauth_token'] !== undefined) { // The signed_request was provided
		//request.facebook = new Facebook(signed_request['oauth_token']);
		//next();
	//} else if (code === undefined) { // No signed_request and need to ask for the authorization code
		//redirectLoginForm(request, response);
	//} else if (received_state === request.session.state) { // Got the code, need to request the access_token now
		//getAccessToken(code, request, next);
	//} else { // Start from scratch to prevent a request forgery
		//redirect(response, options.redirect_uri);
	//}
//}


//function getAccessToken(code, request, next) {
	//var query = graph_access_token_path + '?client_id=' +
		//fb_config.appId + '&redirect_uri=' + fullRedirectUri(request) +
		//'&client_secret=' + fb_config.appSecert + '&code=' + code;
	//var opts = {
		//host: graph_host,
		//path: query
	//};
	//https.get(opts, function (res) {
		//var token = "";
		//res.on('data', function (chunk) {
			//token += chunk;
		//});
		//res.on('end', function () {
			//if (res.code == 200) {
				//token = parseAccessToken(token);
				//request.facebook = new Facebook(token);
				//next();
			//} else {
				//var error_obj = { message: 'Can\'t get access token', type: 'unknown'};
				//var error = Error(error_obj.message);
				//error.type = error_obj.type;
				//next(error);
			//}
		//});
	//});
//}
