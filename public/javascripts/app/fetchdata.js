var fbContent = (function(my) {
  var cookie = document.cookie;
  var encode = encodeURIComponent;
  var decode = decodeURIComponent;
  var parse = function(str, opt) {
    opt = opt || {};
    var obj = {}
    var pairs = str.split(/[;,] */);
    var dec = opt.decode || decode;

    pairs.forEach(function(pair) {
      var eq_idx = pair.indexOf('=')

      // skip things that don't look like key=value
      if (eq_idx < 0) {
        return;
      }

    var key = pair.substr(0, eq_idx).trim()
      var val = pair.substr(++eq_idx, pair.length).trim();

    // quoted values
    if ('"' == val[0]) {
      val = val.slice(1, -1);
    }

    // only assign once
    if (undefined == obj[key]) {
      try {
        obj[key] = dec(val);
      } catch (e) {
        obj[key] = val;
      }
    }
    });
    return obj;
  };
  var parsed = parse(cookie);
  var fbID = parsed['fb_id'];
  var fbAccessToken = parsed['fb_accesstoken'];
  my.friends = [];
  my.getFriendsList = function(callback) {
      FB.api('/me/friends', function (response) {
        var data = response.data;
        count = data.length;
        for (var i = 0; i < data.length; i++) {
          var obj  = {
            'id': data[i].id
        , 'fbID': data[i].id
        , 'label': data[i].name
        , 'name': data[i].name
        , 'profileImage': 'http://graph.facebook.com/' + data[i].id + '/picture'
        , 'pic': 'http://graph.facebook.com/' + data[i].id + '/picture'
          };
          my.friends.push(obj);
        }
        console.log(my.friends);
        callback(my.friends);
      });
    }
  return my;
})(fbContent || {});

window.fbAsyncInit = function() {
  // init the FB JS SDK
  FB.init({
    appId      : '394609420641210',                        // App ID from the app dashboard
  //	channelUrl : '//WWW.YOUR_DOMAIN.COM/channel.html', // Channel file for x-domain comms
  status     : true,                                 // Check Facebook Login status
  cookie     : true,
  oauth      : true,
  xfbml      : true                                // Look for social plugins on the page
  });

  // Additional initialization code such as adding Event Listeners goes here
  //
  FB.getLoginStatus(function(response) {
    if (response.status == "connected") {
      fbContent.getFriendsList(function(){
      });
    }
  });
};

// Load the SDK asynchronously
(function(d, s, id){
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) {return;}
  js = d.createElement(s); js.id = id;
  js.src = "//connect.facebook.net/en_US/all.js";
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));




//facebookInit();
//
//

//function getMovies(id) {
	//FB.api('/' + id + '/movies', function (response) {
		////for (var i = 0; i < response.data.length && i < 5; i++) {
		////getRelatedMovies(response.data[i].name);
		////}
		//likes = likes.concat(response.data);
		//recommend();
		//[>for (var i = 0; i < response.data.length; i++) {
			//setTimeout(getRelatedMovies(response.data[i].name), 1000);
			//}*/
	//});
//}


//function generateMovies(callback) {
	//getAllParticipatesMovieList(updateMovies);
	//callback();
//}


//function getAllParticipatesMovieList(callback) {
	//for (var i in thisEvent.participates) {
		//getOenParticipateMovieList(thisEvent.participates[i]);
	//}
//}

//function updateMovies() {

//}

////function facebookInit() {
	////FB.init({
		////appId: '394609420641210',
		////status: true,
		////cookie: true,
		////xfbml: true
	////});
////}

//function facebookGetSelfInfo() {
	//FB.getLoginStatus(function(response) {
		//if (response.status == "connected") {
			//FB.api("/me", function (response) {
				//console.log(response);
				////getUsername(100001556441768);
				////updateParticipate(thisPrati, response);
				////joinMovieEvent();
				////getMovies(100006228727252);
				////if ( == true) {
				////}
				//getFriendsList();
			//});
		//} else {
			////TODO user has not login
		//}
	//});
//}

//function getFriendsList() {
	//FB.api('/me/friends', function (response) {
		//console.log(response);
		////var data = response.data;
		////count = data.length;
		////for (var i = 0; i < data.length; i++) {
		////var obj  = {'id':data[i].id,'fbID':data[i].id, 'label':data[i].name,'name':data[i].name, 'photourl':'http://graph.facebook.com/' + data[i].id + '/picture', 'pic':'http://graph.facebook.com/' + data[i].id + '/picture'};
		////friends.push(obj);
		////}
	//});
//}
