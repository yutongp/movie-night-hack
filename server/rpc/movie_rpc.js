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
			if (parti.isHost) {
				this.host = parti;
			}
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
	this.trailerurl = "";
	this.rate = 0;
	this.pgRate = "";
	this.description = "";
	this.genre = "";
	this.vote = 0;
}

//////////////////////////
//

var allEvent = {};
var eventCounter = 0;


exports.actions = function(req, res, ss) {

	// Example of pre-loading sessions into req.session using internal middleware
	req.use('session');

	return {
		joinEvent: function (eventID, parti, loca, time) {
			console.log(eventID);
			if (eventID === -1) {
				// new event
				eventID = eventCounter;
				var thisEvent = new MovieEvent(eventID, parti, loca, time);
				allEvent[eventID] = thisEvent;
				eventCounter++;
			}

			if (allEvent[eventID] === undefined) {
				return false;
			}

			thisEvent.addParticipate(parti);
			//TODO update list
			req.session.channel.subscribe(eventID);
			req.session.setUserId(parti.fbID);
			ss.publish.channel(eventID, 'newPartiOnine', parti);
			return res(allEvent[eventID]);
		},

		partiOffline: function(eventID, parti) {
		},

	};
};
