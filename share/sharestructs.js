// share code
var HALF_STARCODE = "&#xF123;";
var FULL_STARCODE = "&#xF005;";
var EMPTY_STARCODE = "&#xF006;";

function MovieEvent (eventid, eventHost, lo, ti) {
	this.participates = {};
	this.comrecoMovies = {};
	this.selectedMovies = {};
	this.movieList = new Array();
	this.sortedMovies = new Array();
	this.loca = lo;
	this.time = ti;
	this.eventID = eventid;
	this.host = eventHost;
	this.partiNum = 0;

	this.addParticipate = function (parti) {
		if (this.participates[parti.fbID] == undefined) {
			this.participates[parti.fbID] = new Participate();
			this.participates[parti.fbID].state = "panding";
			this.participates[parti.fbID].name = parti.name;
			this.participates[parti.fbID].photourl = parti.photourl;
			this.participates[parti.fbID].usrname = parti.usrname;
			this.participates[parti.fbID].fbID = parti.fbID;
			this.partiNum++;

			if (parti.isHost) {
				this.host = parti;
			}
			return true;
		} else {
			return false;
		}
	}

	this.partiOnline = function (parti) {
		if (this.participates[parti.fbID] == undefined) {
			this.addParticipate(parti);
		}
		this.participates[parti.fbID].state = "online";
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
	this.usrname = "";
	this.photourl = "";
	this.recommandMovies = {};
	this.friendList = {};
	this.state = "";
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

