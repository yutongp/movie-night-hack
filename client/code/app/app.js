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

$(document).ready(function(){
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
        var obj  = {'id':data[i].id, 'name':data[i].name, 'pic':'http://graph.facebook.com/' + data[i].id + '/picture'};
        friends.push(obj);
        console.log(obj);
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

	$("#select").autocomplete({
            source: friends,
			select: function(e, obj) {
				$('<li class="ui-state-default"><img class="friend-avatar" src=' + obj.item.pic + '/>' + obj.item.name + '<a class="close">x</a></li>').hide().prependTo("#sortable").show("slide", {direction:"left"},"fast");
				$(".close").on('click', function()
						{
							$(this).parent().hide("slide",{direction:"left"},"slow");
						});
			}

	}).data("ui-autocomplete")._renderItem = function (ul, item) {
		return $("<li/>")
			.append('<a><img class="friend-avatar" src='+item.pic+'/>' + item.name + '</a>')
			.appendTo(ul);
	};

});
