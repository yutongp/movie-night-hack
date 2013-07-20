function getMovies(id) {
	FB.api('/' + id + '/movies', function (response) {
		//for (var i = 0; i < response.data.length && i < 5; i++) {
		//getRelatedMovies(response.data[i].name);
		//}
		likes = likes.concat(response.data);
		recommend();
		/*for (var i = 0; i < response.data.length; i++) {
		  setTimeout(getRelatedMovies(response.data[i].name), 1000);
		  }*/
	});
}


function generateMovies(callback) {
	getAllParticipatesMovieList(updateMovies);
	callback();
}


function getAllParticipatesMovieList(callback) {
	for (var i in thisEvent.participates) {
		getOenParticipateMovieList(thisEvent.participates[i]);
	}
}

function updateMovies() {

}

//function facebookInit() {
	//FB.init({
		//appId: '394609420641210',
		//status: true,
		//cookie: true,
		//xfbml: true
	//});
//}

function facebookGetSelfInfo() {
	FB.getLoginStatus(function(response) {
		if (response.status == "connected") {
			FB.api("/me", function (response) {
				console.log(response);
				//getUsername(100001556441768);
				//updateParticipate(thisPrati, response);
				//joinMovieEvent();
				//getMovies(100006228727252);
				//if ( == true) {
				//}
				getFriendsList();
			});
		} else {
			//TODO user has not login
		}
	});
}

function getFriendsList() {
	FB.api('/me/friends', function (response) {
		console.log(response);
		//var data = response.data;
		//count = data.length;
		//for (var i = 0; i < data.length; i++) {
		//var obj  = {'id':data[i].id,'fbID':data[i].id, 'label':data[i].name,'name':data[i].name, 'photourl':'http://graph.facebook.com/' + data[i].id + '/picture', 'pic':'http://graph.facebook.com/' + data[i].id + '/picture'};
		//friends.push(obj);
		//}
	});
}
window.fbAsyncInit = function() {
	// init the FB JS SDK
	FB.init({
		appId      : '394609420641210',                        // App ID from the app dashboard
	//	channelUrl : '//WWW.YOUR_DOMAIN.COM/channel.html', // Channel file for x-domain comms
		status     : true,                                 // Check Facebook Login status
		xfbml      : true                                // Look for social plugins on the page
	});

	// Additional initialization code such as adding Event Listeners goes here
	facebookGetSelfInfo();
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
