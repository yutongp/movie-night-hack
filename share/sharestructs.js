// share code

module.exports = {
	var HALF_STARCODE = "&#xF123;";
	var FULL_STARCODE = "&#xF005;";
	var EMPTY_STARCODE = "&#xF006;";

	function MovieEvent (eventID, eventHost, location, time) {
		this.users = {};
		this.comrecoMovies = {};
		this.selectedMovies = {};
		this.movieList = new Array();
		this.sortedMovies = new Array();
		this.location = location;
		this.time = time;
		this.eventID = eventID;
		this.host = eventHost;
		this.userNum = 0;

		this.addUser = function (user) {
			if (this.users[user.fbID] === undefined) {
				this.users[user.fbID] = new User();
				this.users[user.fbID].state = "pending";
				this.users[user.fbID].name = user.name;
				this.users[user.fbID].photourl = user.photourl;
				this.users[user.fbID].username = user.username;
				this.users[user.fbID].fbID = user.fbID;
				this.userNum++;

				if (user.isHost) {
					this.host = user;
				}
				return true;
			} else {
				return false;
			}
		}

		this.userOnline = function (user) {
			if (this.users[user.fbID] === undefined) {
				this.addUser(user);
			}
			this.users[user.fbID].state = "online";
		}

		this.addComRecoMovies = function (movie) {
			if (this.comrecoMovies[movie.movieID] === undefined) {
				this.comrecoMovies[movie.movieID] = movie;
				return true;
			} else {
				return false;
			}
		}

		this.addSelectedMovies = function (movie) {
			if (this.selectedMovies[movie.movieID] === undefined) {
				this.selectedMovies[movie.movieID] = movie;
				return true;
			} else {
				return false;
			}
		}
	}

	function User() {
		this.name = "";
		this.fbID = "";
		this.username = "";
		this.photourl = "";
		this.recommendMovies = {};
		this.friendList = {};
		this.state = "";
		this.isHost = false;
		this.isOnline = false;

		this.addRecommendMovies = function (movie) {
			if (this.recommendMovies[movie.movieID] === undefined) {
				this.recommendMovies[movie.movieID] = movie;
				return true;
			} else {
				return false;
			}
		}
	}

	function Movie() {
		actors: ""
		, director: ""
		, genre: ""
		, poster: ""
		, rated: ""
		, released: ""
		, response: ""
		, runtime: ""
		, title: ""
		, type: ""
		, writer: ""
		, year: ""
		, movieID: ""
		, imdbID: ""
		, imdbRating: 0
		, vote: 0
	}
}
