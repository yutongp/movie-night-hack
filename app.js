/**
 * Module dependencies.
 */

var express = require('express')
	, routes = require('./routes')
	, user = require('./routes/user')
	, http = require('http')
	, path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 8080);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.set('env', 'development');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'share')));

// development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/:eventID', routes.index);
app.get('/users', user.list);

var server = http.createServer(app).listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});

var io = require('socket.io').listen(server);


function movieEvent (eventID) {
	this.p = {};
	this.movieList = {};
	this.recoMovies = {};
}


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
});

