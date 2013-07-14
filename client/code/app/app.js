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
	this.rate = 0;
	this.pgRate = "";
	this.description = "";
	this.vote = 0;
}

///////////////////
// Client Code
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
	$(".panel.panel-"+ index).attr("movie-id", movie.movieID);
}



$(document).ready(function(){
	var aM = new Movie();
	aM.title = "Inception";
	aM.movieID = 10222;
	aM.imgurl = 'http://upload.wikimedia.org/wikipedia/en/7/7f/Inception_ver3.jpg';
	aM.rate = 8.4;
	for (var i = 0; i < 8; i++) {
		addMovieContainer(aM, i, ".front");
		addMovieContainer(aM, i, ".back");
	}
	OffScreenNav.init();
	function init() {
		FB.init({
			appId: '389973247769015',
			status: true,
			cookie: true,
			xfbml: true
		});
		FB.getLoginStatus(function(response) {
			if (response.status == "connected") {
				showFriendsList();
			}
		});
	}

	init();

	var friends=[];
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

	$('.panel').toggle(function(){
		$(this).addClass('flip');
	},function(){
		$(this).removeClass('flip');
	});

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

});
