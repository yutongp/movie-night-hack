// Client Code
//
function MovieEvent (eventid, eventHost, lo, ti) {
	this.participates = {};
	this.comrecoMoives = {};
	this.loca = lo;
	this.time = ti;
	this.eventID = eventid;
	this.selectedMovies = {};
	this.host = eventHost;

	this.addParticipate (parti) {
		if (this.participates[parti.fbID] == undefined) {
			this.participates[parti.fbID] = new Participate();
			return true;
		} else {
			return false;
		}
	}

	this.addComrecoMovies(movie) {
		if (this.comrecoMoives[movie.movieID] == undefined) {
			this.comrecoMoives[movie.movieID] = movie;
			return true;
		} else {
			return false;
		}
	}

	this.addSelectedMovies(movie) {
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

	this.addRecommandMovies(movie) {
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

$(document).ready(function(){
	OffScreenNav.init();

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


	$("#select").autocomplete({
		source: function (request, response) {
			$.ajax({
				url: "http://api.stackoverflow.com/1.1/users",
				data: {
					filter: request.term,
				pagesize: 5
				},
				jsonp: "jsonp",
				dataType: "jsonp",
				success: function(data) {
					response($.map(data.users, function(el, index) {
						return {
							value: el.display_name,
					avatar: "http://www.gravatar.com/avatar/" +
						el.email_hash
						};
					}));
				}
			});
		},
			select: function(e, obj) {
				console.log(obj.item.value);
				$('<li class="ui-state-default"><span class="ui-icon ui-icon-arrowthick-2-n-s"></span><img src=' + obj.item.avatar + '/>' + obj.item.value + '<a class="close">x</a></li>').hide().prependTo("#sortable").show("slide", {direction:"left"},"fast");
				$(".close").on('click', function()
						{
							//$(this).parent().fadeOut("fast");;
							$(this).parent().hide("slide",{direction:"left"},"slow");
						});
			}

	}).data("uiAutocomplete")._renderItem = function (ul, item) {
		return $("<li />")
			.data("item.autocomplete", item)
			.append("<a><img src='" + item.avatar + "' />" + item.value + "</a>")
			.appendTo(ul);
	};


});
