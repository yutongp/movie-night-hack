// share code
var HALF_STARCODE = "&#xF123;";
var FULL_STARCODE = "&#xF005;";
var EMPTY_STARCODE = "&#xF006;";

function MovieEvent (eventid, eventHost, lo, ti) {
	this.participates = {};
	this.comrecoMovies = {};
	this.selectedMovies = {};
	this.sortedMovies = new Array();
	this.loca = lo;
	this.time = ti;
	this.eventID = eventid;
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
		if (this.comrecoMovies[movie.movieID] == undefined) {
			this.comrecoMovies[movie.movieID] = movie;
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
	this.recommandMovies = {};
	this.friendList = {};
	this.isHost = false;
	this.isOnline = false;

	this.addRecommandMovies = function (movie) {
		if (this.recommandMovies[movie.movieID] == undefined) {
			this.recommandMovies[movie.movieID] = movie;
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
			if (eventID === -1) {
				// new event
				eventID = eventCounter;
				var thisEvent = new MovieEvent(eventID, parti, loca, time);
				allEvent[eventID] = thisEvent;
				eventCounter++;
			} else {
				// add event
				thisEvent = allEvent[eventID];
			}

			if (allEvent[eventID] === undefined) {
				return res(false);
			}

			console.log("server set event", eventID);
			console.log("server set parti", parti.name);
			console.log("server set parti", parti.fbID);
			thisEvent.addParticipate(parti);
			//TODO update list
			req.session.channel.subscribe(eventID);
			req.session.setUserId(parti.fbID);
			ss.publish.channel(eventID, 'newPartiOnine', parti);
			return res(allEvent[eventID]);
		},

		partiOffline: function(eventID, parti) {
			var thisEvent = allEvent[eventID];
			if (thisEvent === undefined) {
				console.log("!!!!!!! undefined Event", eventID);
			}
		},

		thisPartiVote: function(eventID, movie, isUp) {
			var thisEvent = allEvent[eventID];
			if (thisEvent === undefined) {
				console.log("!!!!!!! undefined Event", eventID);
			}
			thisEvent.addSelectedMovies(movie);
			if (isUp) {
				thisEvent.selectedMovies[movie.movieID].vote++;
			}
			else {
				thisEvent.selectedMovies[movie.movieID].vote--;
			}
			ss.publish.channel(eventID, 'partiVote', thisEvent.selectedMovies[movie.movieID]);
		},

		updateComrecoMovies: function(eventID, movies, sorted) {
			var thisEvent = allEvent[eventID];
			if (thisEvent === undefined) {
				console.log("!!!!!!! undefined Event", eventID);
				return res(false);
			}
			if (sorted === undefined || movies === undefined) {
				console.log("{{{{SHITTTTTT}}}}}");
			} else {
				thisEvent.sortedMovies = sorted;
				thisEvent.comrecoMovies = movies;
				ss.publish.channel(eventID, 'updateMovies', movies, sorted);
			}
		}

	};
};
