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

	this.addParticipate = function (parti) {
		if (this.participates[parti.fbID] == undefined) {
			this.participates[parti.fbID] = new Participate();
			this.participates[parti.fbID].state = "panding";
            this.participates[parti.fbID].name = parti.name;
            this.participates[parti.fbID].photourl = parti.photourl;
            this.participates[parti.fbID].usrname = parti.usrname;
            this.participates[parti.fbID].fbID = parti.fbID;

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

//////////////////////////
//

var allEvent = {};
var eventCounter = 0;

var nodemailer = require("nodemailer");

// create reusable transport method (opens pool of SMTP connections)
var smtpTransport = nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
        user: "movie.night.hackday@gmail.com",
        pass: "test123123"
    }
});


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
				console.log("new comer in", parti.name);
			}

			if (allEvent[eventID] === undefined) {
				return res(false);
			}

			console.log("server set event", eventID);
			console.log("server set parti", parti.name);
			console.log("server set parti", parti.fbID);
			thisEvent.partiOnline(parti);
			req.session.channel.subscribe(eventID);
			req.session.setUserId(parti.fbID);
			ss.publish.channel(eventID, 'newPartiOnline', parti);
			ss.publish.channel(eventID, 'updateFriendList', thisEvent.participates);
			return res(allEvent[eventID]);
		},

		partiOffline: function(eventID, parti) {
			var thisEvent = allEvent[eventID];
			if (thisEvent === undefined) {
				console.log("!!!!!!! undefined Event", eventID);
			}
			thisEvent.participates[parti.fbID].state = "offline";
			ss.publish.channel(eventID, 'updateFriendList', thisEvent.participates);
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

		updateComrecoMovies: function(eventID, movies, sorted, ml) {
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
				thisEvent.movieList = ml;
				ss.publish.channel(eventID, 'updateMovies', movies, sorted);
			}
		},
		sendInvite: function (eventID, name, listm) {
			var thisEvent = allEvent[eventID];
			if (thisEvent === undefined) {
				console.log("!!!!!!! undefined Event", eventID);
				return res(false);
			}
			for (var i = 0; i < listm.length; i++) {

				if (listm[i] === undefined) {
					continue;
				}
				thisEvent.addParticipate(listm[i])
				
				// setup e-mail data with unicode symbols
				var mailOptions = {
					from: "Amazon Movie Socials <movie.night.hackday@gmail.com>", // sender address
					to: listm[i].usrname + "@facebook.com", // list of receivers
					subject: "Amazon Movie Socials Invitation for " + name, // Subject line
					text: "http://yutong.me/test?eventID=" + eventID, // plaintext body
					html: '<a href="http://yutong.me/test?eventID=' + eventID + '">Accept Invitation</a>' // html body
				}

				// send mail with defined transport object
				smtpTransport.sendMail(mailOptions, function(error, response){
					if(error){
						console.log(error);
					}else{
						console.log("Message sent: " + response.message);
					}
					// if you don't want to use this transport object anymore, uncomment following line
					//smtpTransport.close(); // shut down the connection pool, no more messages
				});
			}
			ss.publish.channel(eventID, 'updateFriendList', thisEvent.participates);
		},

	};
};
