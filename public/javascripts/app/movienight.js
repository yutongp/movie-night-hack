
  var socket;
  var eventID;
  var spinner;
var movieSocket = (function() {

  var matches = document.location.href.match(/\/event\/([^\/]+)/);
  if(matches) {
    eventID = matches[1];
    socket = io.connect('http://127.0.0.1:8080');
    //socket = io.connect('http://127.0.0.1:8080');


    socket.on('connect', function() {
      // Connected, let's sign-up for to receive messages for this room
      socket.emit('room', eventID);
      var opts = {
        lines: 13, // The number of lines to draw
        length: 20, // The length of each line
        width: 10, // The line thickness
        radius: 30, // The radius of the inner circle
        corners: 1, // Corner roundness (0..1)
        rotate: 0, // The rotation offset
        direction: 1, // 1: clockwise, -1: counterclockwise
        color: '#000', // #rgb or #rrggbb or array of colors
        speed: 1, // Rounds per second
        trail: 60, // Afterglow percentage
        shadow: false, // Whether to render a shadow
        hwaccel: false, // Whether to use hardware acceleration
        className: 'spinner', // The CSS class to assign to the spinner
        zIndex: 2e9, // The z-index (defaults to 2000000000)
        top: '300', // Top position relative to parent in px
        left: 'auto' // Left position relative to parent in px
      };
      spinner = new Spinner(opts).spin(document.getElementById('spin'));

      socket.emit('requestForMovies', eventID, ['100001503913338']);
    });

    socket.on('message', function(data) {
      console.log('Incoming message:', data);
    });

    socket.on('friendsList', function(id, token, data) {
      console.log('Incoming message:', data[10], data[12]);
      socket.emit('invitedFriends', id, token, [data[10], data[12]]);
    });

    socket.on('moviesData', function(results){
      spinner.stop();
      moviePanel.updatePanel(sortMovies(results));
    });
  }

  return {
    requireMovies: function(idArray, callback) {
    }
  }
})();

var sortMovies = function (hashMovies) {
  function popularMovies(movieA, movieB) {
    if (movieA.ref < movieB.ref) {
      return 1;
    } else if (movieA.ref > movieB.ref) {
      return -1;
    } else {
      if (movieA.imdbRating < movieB.imdbRating) {
        return 1;
      } else if (movieA.imdbRating > movieB.imdbRating) {
        return -1;
      } else {
        return 0;
      }
    }
  }
  var movieList = [];
  for (var key in hashMovies) {
    movieList.push(hashMovies[key]);
  }
  movieList.sort(popularMovies);
  return movieList;
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
      socket.emit('requestForMovies', eventID, ['600923123', '659337432']);
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


var moviePanel = function () {
  var HALF_STARCODE = "&#xF123;";
  var FULL_STARCODE = "&#xF005;";
  var EMPTY_STARCODE = "&#xF006;";
  var currentNUM = 0;
  //TODO dynamic change RECOMMANDNUM
  var RECOMMANDNUM = 8;

  var addMovieContainer = function (movie, index, side) {
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
    var sideObj = $(".panel.panel-"+ index).find(side);
    sideObj.find(".movie-image1").html('<img src=' + movie.poster + ' >');
    sideObj.find(".movie-image2").html('<img src=' + movie.poster + ' >');
    addRate(sideObj.find(".rating"), movie.imdbRating);
    sideObj.find(".panel-vote").attr("movie-id", movie.imdbID);
    sideObj.find(".panel-trailer").attr("movie-title", movie.title);
    sideObj.find(".panel-vote").attr("panel-index", index);
    sideObj.find(".panel-title").html('<h4>' + movie.title +'</h4>');
    sideObj.find(".panel-pg-rate").html(movie.rated + " - " + movie.genre);
    sideObj.find(".panel-description").html('<p>' + movie.plot + '</p>');
  }

  var appendPanel = function (index) {
    $(".panel-"+index).removeClass('invisible');
    $(".panel-"+index).find(".panel-vote").bind("click", function() {
      voteOnComrecoMovies(this);
    });
    $(".panel-"+index).find(".panel-trailer").bind("click", function() {
      //TODO add play Trailer back
      //playTrailer($(this).attr("movie-title"));
    });
  }

  var flipPanelTo = function (ind, side) {
    if (side === ".back") {
      $('.panel-' + ind).addClass("flip");
    } else if (side === ".front") {
      $('.panel-' + ind).removeClass("flip");
    }
  }

  var updatePanel = function (sortedMovies) {
    for (var i = 0; i < sortedMovies.length && i < RECOMMANDNUM; i++) {
          console.log("DDDDDDD____", currentNUM);
      if(i < sortedMovies.length && i < RECOMMANDNUM) {
        if (currentNUM < RECOMMANDNUM) {
          console.log(":::::::::",i,":::::::::");
          appendPanel(currentNUM);
          addMovieContainer(sortedMovies[i], i,".front");
          currentNUM++;
        } else {
          var side = '.front';
          var alterSide = '.back';
          if ($('.panel-'+i).hasClass('flip')) {
            side = '.back';
            alterSide = '.front';
          }
          if ( $(".panel.panel-"+ i)
              .find(side).find(".panel-vote")
              .attr("movie-id") != sortedMovies[i].imdbID) {

                addMovieContainer(sortedMovies[i], i, alterSide);
                setTimeout(flipPanelTo(i, alterSide), 300);

          }
        }
      }
    }
  }

  return {
    updatePanel: updatePanel
  }
}();



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


  var friends_invited = [];
  $('.invite-new-friend').bind("click", function(){
    console.log("heeeeey");
    console.log(friends_invited);
    //invite(friends_invited);
    $("#offscreen-addfriend").css("top", "0%");
  });

  function get_user_name(uid, callback) {
    FB.api("/" + uid, function (response) {
      console.log(response.username);
      callback(response.username, uid);
    });
  }


  var hash_chat_heads = {};
  $('.invite-new-friend-close-cancel').bind('click', function() {
    $(".close").click();
    $("#sortable").empty();
    $("#offscreen-addfriend").css("top", "100%");
  });

  function append_username(id, username)
  {
    for(var i=0;i<invited_friends_objects.length;i++)
    {
      if(invited_friends_objects[i].id = id)
        invited_friends_objects[i]['usrname'] = username;
    }
  }
  $('.invite-new-friend-close').bind("click", function(){
    $("#sortable").empty();
    $("#offscreen-addfriend").css("top", "100%");
    console.log(invited_friends_ids);
    console.log(invited_friends_objects);
    for(var i=0;i<invited_friends_objects.length;i++)
  {
    var friend = invited_friends_objects[i];
    if(!(friend.id in hash_chat_heads))
  {
    /*$('<li class="ui-state-default"><img class="friend-avatar" src=' + friend.photo + '/>' + friend.label + '</li>').hide().prependTo("#final_selected_list").show("slide", {direction:"left"},"fast");*/
    hash_chat_heads[friend.id] = 1;
  }
  }
  for(var i=0;i<invited_friends_ids.length;i++)
  {
    get_user_name(invited_friends_ids[i], function(username, id){
      invited_friends_names.push(username);
      append_username(id, username);
      if(invited_friends_ids.length == invited_friends_names.length) {
        console.log(invited_friends_names);
        postFeed();
        console.log(invited_friends_objects);
        ss.rpc('movie_rpc.sendInvite', thisEventID, thisPrati.name, invited_friends_objects);
      }

    });
  }
  });

  $( "#sortable" ).sortable();

  var hash = {};
  var invited_friends_ids = [];
  var invited_friends_names = [];
  var invited_friends_objects = [];
  $("#select").autocomplete({
    source: fbContent.friends,
    close: function(e,obj) {
      $("#select").val("");
    },
    select: function(e, obj) {
      var pic = obj.item.profileImage;
      if(!(pic in hash))
  {
    $('<li class="ui-state-default"><img class="friend-avatar" src=' + pic + '>' + obj.item.name + '<a class="close">x</a></li>').hide().prependTo("#sortable").show("slide", {direction:"left"},"fast");
    hash[pic]=1
    invited_friends_ids.push(obj.item.fbID);
  invited_friends_objects.push(obj.item);
  $(".close").on('click', function(){
    var pic = $(this).parent().find('img').attr('src');
    var temp = [];
    delete hash[pic];
    for(var i=0;i<invited_friends_objects.length;i++)
  {
    console.log(invited_friends_objects[i].pic);
    console.log(pic);
    if(invited_friends_objects[i].pic!=pic)
    temp.push(invited_friends_objects[i]);
  }
  console.log("invited " +invited_friends_objects);
  console.log("temp "+temp);
  invited_friends_objects = temp;
  $(this).parent().hide("slide",{direction:"left"},"slow");
  });
  }
    }
  }).data("ui-autocomplete")._renderItem = function (ul, item) {
    return $("<li/>")
      .append('<a><img class="friend-avatar" src='+item.profileImage+'/>' + item.name + '</a>')
      .appendTo(ul);
  };

});
