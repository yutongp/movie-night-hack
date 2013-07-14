// share code
var HALF_STARCODE = "&#xF123;";
var FULL_STARCODE = "&#xF005;";
var EMPTY_STARCODE = "&#xF006;";

function MovieEvent (eventid, eventHost, lo, ti) {
	this.participates = {};
	this.comrecoMoives = {};
	this.loca = lo;
	this.time = ti;
	this.eventID = eventid;
	this.selectedMovies = {};
	this.host = eventHost;

	this.addParticipate = function (parti) {
		if (this.participates[parti.fbID] == undefined) {
			this.participates[parti.fbID] = new Participate();
			return true;
		} else {
			return false;
		}
	}

	this.addComrecoMovies = function (movie) {
		if (this.comrecoMoives[movie.movieID] == undefined) {
			this.comrecoMoives[movie.movieID] = movie;
			return true;
		} else {
			return false;
		}
	}

	this.addSelectedMovies = function (movie) {
		if (this.selectedMovies[movie.movieID] == undefined) {
			this.selectedMovies[movie.movieID] = movie;
			return true;
		} else {
			return false;
		}
	}
}


allEvent = {};

function Participate () {
	this.name = "";
	this.fbID = "";
	this.photourl = "";
	this.recommandMoives = {};
	this.friendList = {};
	this.isHost = false;
	this.online = false;

	this.addRecommandMovies = function (movie) {
		if (this.recommandMoives[movie.movieID] == undefined) {
			this.recommandMoives[movie.movieID] = movie;
			return true;
		} else {
			return false;
		}
	}
}

function Movie () {
	this.movieID = "";
	this.title = "";
	this.imgurl = "";
	this.score = 0;
	this.pgRate = "";
	this.description = "";
	this.vote = 0;
}
exports.actions = function(req, res, ss) {

	// Example of pre-loading sessions into req.session using internal middleware
	req.use('session');
	var query = require('url').parse(req.url,true).query;
	console.log(query);


	return {
		joinEvent: function (eventID) {
			var thisEvent = eventMap[eventID];
			//thisEvent.add(player.name, player.color);
			//req.session.channel.subscribe(eventID);
			//req.session.setUserId(player.name);
			//ss.publish.channel(roomNumber, 'newPlayerIn', player);
		},

		

	};
};
