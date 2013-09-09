var movieSocket = (function() {
  var eventID;
  var socket;

  var matches = document.location.href.match(/\/event\/([^\/]+)/);
  if(matches) {
    eventID = matches[1];
    socket = io.connect('http://127.0.0.1:8080');


    socket.on('connect', function() {
      // Connected, let's sign-up for to receive messages for this room
      socket.emit('room', eventID);
    });

    socket.on('message', function(data) {
      console.log('Incoming message:', data);
    });

    socket.on('friendsList', function(id, token, data) {
      console.log('Incoming message:', data[10], data[12]);
      socket.emit('invitedFriends', id, token, [data[10], data[12]]);
    });
  }

  return {
    
  
  }
})();


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


function appendPanel(ind) {
	$(".movie-container").append(ss.tmpl['panel'].render({panel_index: ind}));

	$(".panel-"+ind).find(".panel-vote").bind("click", function() {
		voteOnComrecoMovies(this);
	});
	$(".panel-"+ind).find(".panel-trailer").bind("click", function() {
		console.log("dsdsd");
		playTrailer($(this).attr("movie-title"));
	});
}


function addRate(ratingObj, rate) {
  var HALF_STARCODE = "&#xF123;";
  var FULL_STARCODE = "&#xF005;";
  var EMPTY_STARCODE = "&#xF006;";
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
	$(".panel.panel-"+ index).find(side).find(".panel-vote").attr("movie-id", movie.movieID);
	$(".panel.panel-"+ index).find(side).find(".panel-trailer").attr("movie-title", movie.title);
	$(".panel.panel-"+ index).find(side).find(".panel-vote").attr("panel-index", index);
	$(".panel.panel-"+ index).find(side).find(".panel-title").html('<h4>' + movie.title +'</h4>');
	$(".panel.panel-"+ index).find(side).find(".panel-pg-rate").html(movie.pgRate + " - " + movie.genre);
	$(".panel.panel-"+ index).find(side).find(".panel-description").html('<p>' + movie.description + '</p>');
}


$(document).ready(function(){
  OffScreenNav.init();
  //instant search functionality
  $(".filter").submit(function(e) {
    e.preventDefault();
  });

  $(".btn").on('click', function(e) {
    var genre = $(this).attr('value');
    $('.panel').each(function(){
      var re = new RegExp(genre, 'i')
      //console.log("title "+$(this).find('.panel-title').text());
      //console.log("description: "+$(this).find('.panel-description').text());
      if($(this).find('.panel-title').text().match(re) || $(this).find('.panel-pg-rate').text().match(re) ||
        $(this).find('.panel-description').text().match(re)){
          console.log($(this).parent().html());
          $(this).fadeIn("medium");
        }else{
          $(this).fadeOut("medium");
        };

    });

  });

  $(".filter").keyup(function(e) {
    $('.panel').each(function(){
      var re = new RegExp($('.filter').val(), 'i')
      //console.log("title "+$(this).find('.panel-title').text());
      //console.log("description: "+$(this).find('.panel-description').text());
      if($(this).find('.panel-title').text().match(re) || $(this).find('.panel-pg-rate').text().match(re) ||
        $(this).find('.panel-description').text().match(re)){
          console.log($(this).parent().html());
          $(this).fadeIn("medium");
        }else{
          $(this).fadeOut("medium");
        };

    });
  });
});
