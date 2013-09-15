/* Controllers */

function MovieContainerCtrl($scope, $route, $routeParams, $http) {
  $http.get('/api/event/'+$routeParams.eventID).success(function(data) {
    console.log(data);
    //$scope.phones = data;
  });

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
}

//PhoneListCtrl.$inject = ['$scope', '$http'];


function IndexCtrl($scope, $routeParams, $http) {
  //$http.get('phones/phones.json').success(function(data) {
    //$scope.phones = data;
  //});
  console.log("11111", $routeParams.eventID);
  $scope.orderProp = 'age';

}

//IndexCtrl.$inject = ['$scope', '$http'];
