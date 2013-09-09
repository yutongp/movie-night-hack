/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , https = require('https')
  , path = require('path')
  , async = require('async')
  , everyauth = require('everyauth')
  , mongoose = require('mongoose')
  , api_config = require('./api_config');

var app = express();

mongoose.connect(api_config.db);
require('./models.js');

var Event = mongoose.model('Event');
var User = mongoose.model('User');
var Movie = mongoose.model('Movie');

//var usersById = {};
//var usersByFbId = {};
//var nextUserId = 110;

//function addUser (source, sourceUser) {
  //var user;
  //if (arguments.length === 1) { // password-based
    //user = sourceUser = source;
    //user.id = ++nextUserId;
    //return usersById[nextUserId] = user;
  //} else { // non-password-based
    //user = usersById[++nextUserId] = {id: nextUserId};
    //user[source] = sourceUser;
  //}
  //return user;
//}

everyauth.everymodule.userPkey('fbID');

everyauth.everymodule
.findUserById(function (id, callback) {
   User.findOne({fbID: id}, callback);
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
    var promise = this.Promise();
    User.findOne({fbID: fbUserMetadata.id},function(err, user) {
      if (err) return promise.fulfill([err]);
      if(user) {
        // user found, life is good
        console.log("user found, life is good");
        promise.fulfill(user);
      } else {
        // create new user
        console.log("Create New User");
        var user = new User ({
          name: fbData.user.name
          , firstName: fbData.user.first_name
          , lastName: fbData.user.last_name
          , fbID: fbData.user.id
          , username: fbData.user.username
          , profileImage: 'http://graph.facebook.com/' + fbData.user.id + '/picture'
        });

        User.save(function(err,user) {
          if (err) return promise.fulfill([err]);
          promise.fulfill(user);
        });
      }
    });
    return promise;
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
app.get('/createEvent', routes.createEvent);
app.get('/event/:eventID', routes.event);

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
    io.sockets.in(room).emit('message', 'what is going on, party people?');
  });

  socket.on('invitedFriends', function(id, token, friends){
    var friendsIdArray = [];
    for (var i = 0; i < friends.length; i++) {
      friendsIdArray.push(friends[i].id);
    }
    getRelatedMovies(friendsIdArray, token, function(err, movies){

    });
  });
});



var getRelatedMovies = function (id_array, token, cb) {
  /*
   * this helper func is used to push righ value to array since
   * everything is reference in js
   */
  var parallelHelper = function(par, func) {
    return function(callback) {
      func(par, callback);
    };
  };



  var getRelatedMoviesPerUser = function(id, cb) {
    async.waterfall([
        /* get watched movies from fb*/
        function(callback) {
          fbGraphAPI(id, 'video.watches', token, callback);
        },
        /* get movie info */
        function(data, callback) {
          var moviesRTparallelArr = [];
          for (var i = 0; i < data.length; i++) {
            //console.log("!!!!!!!!!!!!!!!!!!!!!", data);
            if (data[i].data.movie) {
              moviesRTparallelArr.push(parallelHelper(
                  data[i].data.movie.title, relatedMoviesFromRT));
              //console.log('tilte',data[i].data.movie.title );
            }
          }
          /* run parallel on all movies for movie info*/
          async.parallel(moviesRTparallelArr, function(err, result) {
            callback(err, result);
          });
        }
        ], function(err, result){cb(err, result);}
        );
  };




  var relatedMoviesFromRT = function(name, cb) {
    async.waterfall([
        /* get movie info from rottentomatoes */
        function(callback) {
          var urlId = 'http://api.rottentomatoes.com/api/public/v1.0/movies.json?'
      + 'apikey=' + api_config.rottentomatoes.apiKey + '&q=' + name
      + '&page_limit=1';
    rtAPI(urlId, callback);
        },
        /* get similar movie info from rottentomatoes */
        function(response, callback) {
          if (response.movies.length > 0) {
            var id = response.movies[0].id;
            var urlId = 'http://api.rottentomatoes.com/api/public/v1.0/movies/'
      + id + '/similar.json?apikey='
      + api_config.rottentomatoes.apiKey;
    rtAPI(urlId, callback);
          } else {
            callback(null, null);
          }
        },
        /* get movie info from imdb */
        function(response, callback) {
          if (!response || response.movies.length === 0) {
            callback(null, null);
          } else {
            var moviesIMDBparallelArr = [];
            for (var i = 0; i < response.movies.length; i++) {
              if (!response.movies[i].alternate_ids ||
                  !response.movies[i].alternate_ids.imdb) {
                continue;
              }
              moviesIMDBparallelArr.push(
                  parallelHelper(response.movies[i].alternate_ids.imdb,
                    function(imdbId, callback) {
                      var url = 'http://www.omdbapi.com/?i=tt' + imdbId;
                      http.get(url, function(res) {
                        var datastring = "";
                        res.on('data', function (chunk) { datastring += chunk;});
                        res.on('end', function () {
                          var obj = JSON.parse(datastring);
                          if (!obj.ERROR) {
                            callback(null, obj);
                          } else {
                            //TODO
                            callback(null, null);
                          }
                        });
                      })
                    }
                  )
              );
            }
            async.parallel(moviesIMDBparallelArr,
                function(err, result){callback(err, result);});
          }
        }
    ], function(err, result) {cb(err, result);});
  }


  var cleanMoviesData = function (err, data, callback) {
    if(!err) {
      var movies = [];
      /* 1. user level */
      for (var i = 0; i < data.length; i++) {
        /* 2. movie group level */
        if (!data[i]) {
          continue;
        }
        for (var j = 0; j < data[i].length; j++) {
          if (!data[i][j]) {
            continue;
          }
          for (var k = 0; k < data[i][j].length; k++) {
            var movie = data[i][j][k];
            if (movie && !movies[movie.imdbID]) {
              if (movie.Response === 'False') {
                console.log(movie);
                continue;
              }
              var thisMovie = new Movie ({
                actors: movie.Actors
                , director: movie.Director
                , plot: movie.Plot
                , rated: movie.Rated
                , released: movie.Released
                , runtime: movie.Runtime
                , title: movie.Title
                , type: movie.Type
                , writer: movie.writer
                , year: movie.Year
                , imdbID: movie.imdbID
                , imdbRating: movie.imdbRating
              });
              movies[movie.imdbID] = thisMovie.toObject();
            }
          }
        }
      }
      callback(err, movies);
    }
  }

  var userMoviesparallelArr = [];
  for (var i = 0; i < id_array.length; i++) {
    userMoviesparallelArr.push(parallelHelper(id_array[i],
          getRelatedMoviesPerUser));
  }
  console.log(userMoviesparallelArr);
  async.parallel(userMoviesparallelArr, function(err, result){
    //console.log(result);
    cleanMoviesData(err, result, cb);
  });
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
        //console.log('fb======', datastring);
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
exports.getRelatedMovies = getRelatedMovies;


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
