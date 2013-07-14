// share code
var HALF_STARCODE = "&#xF123;";
var FULL_STARCODE = "&#xF005;";
var EMPTY_STARCODE = "&#xF006;";

function MovieEvent (eventid, eventHost, lo, ti) {
	this.participates = {};
	this.comrecoMovies = {};
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

///////////////////
// Client Global Var
//
//


var thisEvent;
var thisPrati = new Participate();
var thisEventID = -1;

var RECOMMANDNUM = 8;
var friends=[];

////////////////////
////
// Client Side Code
//

GETURLV = (function () {
	var get = {
		push:function (key,value){
			var cur = this[key];
			if (cur.isArray){
				this[key].push(value);
			}else {
				this[key] = [];
				this[key].push(cur);
				this[key].push(value);
			}
		}
	},
	search = document.location.search,
	decode = function (s,boo) {
		var a = decodeURIComponent(s.split("+").join(" "));
		return boo? a.replace(/\s+/g,''):a;
	};
search.replace(/\??(?:([^=]+)=([^&]*)&?)/g, function (a,b,c) {
	if (get[decode(b,true)]){
		get.push(decode(b,true),decode(c));
	}else {
		get[decode(b,true)] = decode(c);
	}
});
return get;
})();

function getMovies(id) {
	FB.api('/' + id + '/movies', function (response) {
		for (var i = 0; i < response.data.length; i++) {
			getRelatedMovies(response.data[i].name);
		}
	});
}

function getRelatedMovies(name)
{
	var urlId = 'http://api.rottentomatoes.com/api/public/v1.0/movies.json?apikey=jm483swc8eux9rgtcn7hjndz&q='
		+ name + '&page_limit=1';

	$.get(urlId, function (response) {
		if (response.movies.length > 0) {
			var id = response.movies[0].id;
			//alert(response.movies[0].title);
			var url = 'http://api.rottentomatoes.com/api/public/v1.0/movies/'
		+ id + '/similar.json?apikey=jm483swc8eux9rgtcn7hjndz';

	$.get(url, calculateFrequency, "jsonp");
		}
	}, "jsonp");

}

function calculateFrequency(response)
{
	for (var i = 0 ; i < response.movies.length; i++) {
		getIMDBInfo(response.movies[i]);
		//updateFrequency(response.movies[i]);
	}
}

function getIMDBInfo(data) {
	var id = data.alternate_ids.imdb;
	var url = 'http://www.omdbapi.com/?i=tt' + id;
	//alert('title: ' + data.title + ', id: ' + id);

	$.get(url, function (response) {
		//alert("Find " + response.Title);

		data.title = response.Title;
		data.year = response.Year;
		data.imdb_url = response.imdb_url;
		data.director = response.Director;
		data.actors = response.Actors;
		data.rating = response.imdbRating;
		data.rated = response.Rated;
		data.poster = response.Poster;
		data.genre = response.Genre;
		data.plot = response.Plot;

		updateFrequency(data);
	}, "json");
}

function popularMovies(movieA, movieB) {
	if (movieA.count < movieB.count) {
		return 1;
	}
	else if (movieA.count > movieB.count) {
		return -1;
	}
	else {
		if (movieA.rating < movieB.rating) {
			return 1;
		}
		else if (movieA.rating > movieB.rating) {
			return -1;
		}
		else {
			return 0;
		}
	}
}

function updateFrequency(data) {
	var flag = false;
	for (var i = 0; i < movieList.length; i++)
	{
		if (movieList[i].title == data.title) {
			movieList[i].count++;
			flag = true;
		}
	}
	if (flag == false) {
		data.count = 1;
		movieList = movieList.concat(data);
	}

	movieList.sort(popularMovies);

	updateMovies(movieList);

	displayResults();
}

function updateMovies(movieList) {
	thisEvent.comrecoMovies = {};

	for (var i = 0; i < movieList.length; i++) {
		var movie = new Movie();
		var data = movieList[i];
		movie.movieID = data.alternate_ids.imdb;
		movie.title = data.title;
		movie.description = data.plot;
		movie.genre = data.genre;
		movie.imgurl = data.poster;
		movie.pgRate = data.rated;
		movie.rate = data.rating;
		movie.count = data.count;

		thisEvent.addComrecoMovies(movie);
	}
}

function updateParticipate(participate, data) {
	participate.name = data.name;
	participate.fbID = data.id;
	participate.photourl = 'http://graph.facebook.com/' + data.id + '/picture';
}

var OffScreenNav = {
	nav: $("#offscreen-nav"),
	closeButton: $("#effeckt-off-screen-nav-close"),
	init: function() {
		this.bindUIActions();
	},

	bindUIActions: function() {
		$(".meny-arrow").on("click", function() {
			OffScreenNav.toggleNav("offscreen-nav-left-push");
		});
	},

	toggleNav: function(type) {
		// Show
		if (!$("#offscreen-nav").hasClass("offscreen-nav-show")) {

			$("#offscreen-nav").addClass(type);

			setTimeout(function() {
				$("#offscreen-nav").addClass("offscreen-nav-show");
				$(".meny-arrow").html("&#xF0D9;");

			}, 300);

			// Hide
		} else {

			$("#offscreen-nav").removeClass("offscreen-nav-show");

			setTimeout(function() {
				$("#offscreen-nav").removeClass(type);
				$(".meny-arrow").html("&#xF0DA;");
				// WEIRD BUG
				// Have to trigger redraw or it sometimes leaves
				// behind a black box (Chrome 27.0.1433.116)
				$("#offscreen-nav").hide();
				var blah = $("#offscreen-nav").width();
				$("#offscreen-nav").show();
			}, 300);
		}
	}
};


function appendPanel() {
	//TODO change i back to 0
	for (var i = 0; i < 8; i++) {
		$(".movie-container").append(ss.tmpl['panel'].render({panel_index: i}));
	}
}


function addRate(ratingObj, rate) {
	var ratingStar = "";
	for (var i = 0; i < 10; i++) {
		if (i < rate && i + 1 > rate) {
			ratingStar += "<span>" + HALF_STARCODE + "</span>";
		} else if (i < rate) {
			ratingStar += "<span>" + FULL_STARCODE + "</span>";
		} else {
			ratingStar += "<span>" + EMPTY_STARCODE + "</span>";
		}
	}
	ratingObj.html(ratingStar);
}


function addMovieContainer(movie, index, side) {
	$(".panel.panel-"+ index).find(side).find(".movie-image1").html('<img src=' + movie.imgurl + ' >');
	$(".panel.panel-"+ index).find(side).find(".movie-image2").html('<img src=' + movie.imgurl + ' >');
	addRate($(".panel.panel-"+ index).find(side).find(".rating"), movie.rate);
	$(".panel.panel-"+ index).find(".panel-vote").attr("movie-id", movie.movieID);
	$(".panel.panel-"+ index).find(".panel-vote").attr("panel-index", index);
	$(".panel.panel-"+ index).find(".panel-title").html('<h4>' + movie.title +'</h4>');
	$(".panel.panel-"+ index).find(".panel-pg-rate").html(movie.pgRate + " - " + movie.genre);
	$(".panel.panel-"+ index).find(".panel-description").html('<p>' + movie.description + '</p>');
}


function voteOnComrecoMovies(selecter) {
	var mID = $(selecter).attr("movie-id");
	var index = $(selecter).attr("panel-index");

	console.log("this parti vote on", mID);
	console.log("this parti vote on", index);
	if (thisEvent.comrecoMovies[mID] != undefined) {
		var votedmovie = thisEvent.comrecoMovies[mID];
		//TODO add vote in callback NOT HERE
		//votedmovie.vote++;
	} else {
		alert("no voting movie!!");
	}

	if (votedmovie != undefined) {
		ss.rpc("movie_rpc.thisPartiVote", thisEventID, votedmovie, true);
	}
}

function addVoteOnMovie(movie){
	//TODO add vote change order ...
	var value = movie.vote;
	var id = movie.movieID;
	thisEvent.selectedMovies[id].vote = movie.vote;
	console.log(value);
	if (value>0)
	{
		$("span1."+id).text(value);
	}
	else
	{
		$("span1."+id).text(0);
	}
}


function addtoSelectedMlist(movie) {
	//TODO check dup title on the list
		$('<li class="ui-state-default"><a class="upvote"><button class="btn"><i class="icon-arrow-up"></i></button></a><a class="downvote"><button class="btn"><i class="icon-arrow-down"></i></button></a><img class="friend-avatar" src=' + movie.imgurl + '>' + '  votes: <span1 class='+movie.movieID+'></span1></li>').hide().prependTo(".voting").show("slide", {direction:"left"},"fast");
	$('.upvote').on('click', function()
			{
				console.log($(this).parent().find('span1').text());
				var id = parseInt($(this).parent().find('span1').attr('class'));
				ss.rpc("movie_rpc.thisPartiVote", thisEventID, thisEvent.selectedMovies[id],true);

			});
	$('.downvote').on('click', function()
			{
				var id = parseInt($(this).parent().find('span1').attr('class'));
				ss.rpc("movie_rpc.thisPartiVote", thisEventID, thisEvent.selectedMovies[id],false);
			});
	addVoteOnMovie(movie);
	console.log("add", movie.title, "to selected Movie list");
}

$(document).ready(function(){
	appendPanel();
//For #rvote
	$(".panel-vote").bind("click", function() {
		voteOnComrecoMovies(this);
	});

	OffScreenNav.init();
	//$('.panel').toggle(function(){
		//$(this).addClass('flip');
	//},function(){
		//$(this).removeClass('flip');
	//});

	$('.panel').hover(function(){
		$(this).addClass('panel-hover');
	},function(){
		$(this).removeClass('panel-hover');
	});

	$('#invite-new-friend').toggle(function(){
		$("#offscreen-addfriend").css("top", "0%");
	},function(){
		$("#offscreen-addfriend").css("top", "100%");
	});

	$( "#sortable" ).sortable();

	var hash = {};
	$("#select").autocomplete({
		source: friends,
		close: function(e,obj) {
			$("#select").val("");
		},
		select: function(e, obj) {
			var label = obj.item.label;
			if(!(label in hash))
	{
		$('<li class="ui-state-default"><img class="friend-avatar" src=' + obj.item.pic + '/>' + obj.item.label + '<a class="close">x</a></li>').hide().prependTo("#sortable").show("slide", {direction:"left"},"fast");
		hash[obj.item.label]=1
		$(".close").on('click', function()
			{
				$(this).parent().hide("slide",{direction:"left"},"slow");
			});
	}
		}
	}).data("ui-autocomplete")._renderItem = function (ul, item) {
		return $("<li/>")
			.append('<a><img class="friend-avatar" src='+item.pic+'/>' + item.label + '</a>')
			.appendTo(ul);
	};

	//// listen to the server /////
	ss.event.on('newPartiOnline', function (parti) {
		if (parti.fbID === thisPrati.fbID) {
			return;
		}
		if (thisEvent.addParticipate(parti)) {
			//TODO accpeted change status
		} else {
			thisEvent.participates[parti.fbID].isOnline = true;
			//TODO light up online icon;
		}
	});

	ss.event.on('partiVote', function (movie){
		if (thisEvent.addSelectedMovies(movie)) {
			//TODO not on list, add to list;
			addtoSelectedMlist(movie);
		} else {
			addVoteOnMovie(movie);
			//TODO on list, add on vote number;
		}
	});

	//////
	function facebookInit() {
		FB.init({
			appId: '389973247769015',
			status: true,
			cookie: true,
			xfbml: true
		});
		FB.getLoginStatus(function(response) {
			if (response.status == "connected") {
				FB.api("/me", function (response) {
					updateParticipate(thisPrati, response);
					joinMovieEvent();
					//getMovies(100006228727252);
					//if ( == true) {
					//TODO only showFriends for the host
					//}
				});
			}
		});
	}

	facebookInit();
});


function joinMovieEvent() {
	thisEventID = (GETURLV.eventID === undefined)
				? -1
				: GETURLV.eventID;

	var loca = "";
	var time = "";
	if (thisEventID === -1) {
		thisPrati.isHost = true;
		var loca = "Arizona";
		var time = "Now";
	}

	console.log("url eventID:", thisEventID);
	ss.rpc("movie_rpc.joinEvent", thisEventID, thisPrati, loca, time, function(serverEvent){
		console.log("joined event:", serverEvent.eventID);
		thisEventID = serverEvent.eventID;
		thisEvent = new MovieEvent(thisEventID, serverEvent.host, serverEvent.loca, serverEvent.time);
		//sync event

		getMovies(thisPrati.fbID);
		//TODO add callback for showFriendsList
		function showFriendsList() {
			FB.api('/me/friends', showFriend);
		}


		function showFriend(response) {
			var data = response.data;
			count = data.length;
			for (var i = 0; i < data.length; i++) {
				var obj  = {'id':data[i].id, 'label':data[i].name, 'pic':'http://graph.facebook.com/' + data[i].id + '/picture'};
				friends.push(obj);
			}
		}
		showFriendsList();
		//TODO show movie exist
		var aM = new Movie();
		aM.title = "Inception";
		aM.movieID = 10222;
		aM.imgurl = 'http://upload.wikimedia.org/wikipedia/en/7/7f/Inception_ver3.jpg';
		aM.rate = 8.4;
		aM.genre = 'action';
		aM.pgRate = "PG-13";
		aM.description = "Hobbs has Dom and Brian reassemble their crew in order to take down a mastermind who commands an organization of mercenary drivers across 12 countries. Payment? Full pardons for them all.";
		for (var i = 0; i < RECOMMANDNUM; i++) {
			addMovieContainer(aM, i, ".front");
			addMovieContainer(aM, i, ".back");
		}
		thisEvent.addComrecoMovies(aM);
	});
}
