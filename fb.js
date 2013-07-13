var movieList = new Array();
var movieListSorted = new Array();
var count;
var friends_invited = ['100006228727252'];
var friends;

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

function getMovieInfo(title) {
	//alert(title);
	var url = 'http://mymovieapi.com/?title=' + title 
	+ '&type=json&plot=simple&episode=1&limit=1&yg=0&mt=none&lang=en-US&offset=&aka=full&release=simple&business=0&tech=0';
	
	$.get(url, displayMovieInfo, "json");
}

function displayMovieInfo(response) {
	var data = response[0];
	//alert("Data Loaded: " + data.title);
	var divMovie = document.createElement("div");
	divMovie.innerHTML = data.title + "<br>" 
	+ "<a href='" + data.imdb_url + "'><img src='" + data.poster + "'></img></a>"
	+ "Year: " + data.year + "<br>" 
	+ "Country: " + data.country + "<br>" 
	+ "Director: " + data.directors + "<br>"
	+ "Actors: " + data.actors + "<br>"
	+ "Rating: " + data.rating + "<br>";
	
	document.getElementById('movies').appendChild(divMovie);
};
	

function compareMovies(movieA, movieB) {
	if (movieA.name === movieB.name) return 0;
	if (movieA.name > movieB.name) return 1;
	return -1;
}

function popularMovies(movieA, movieB) {
	return movieB.mCount - movieA.mCount;
}

function ShowMyName(name, description, location, start_time) {
	var event = {
			name: name, 
		    description: description,
		    location: location,                        
		    start_time: start_time
	};
	
	FB.api('/me/events', 'post' , event, invite);
}

function showFriendsList() {
	FB.api('/me/friends', showFriend);
}

function showFriend(response) {
	var divTarget = document.getElementById("friends");
	var data = response.data;
	count = data.length;
	for (var i = 0; i < data.length; i++) {
		var divContainer = document.createElement("div");
		divContainer.innerHTML = "<img src='http://graph.facebook.com/" + data[i].id + "/picture'></img>" + data[i].name;
		divTarget.appendChild(divContainer);
		data[i].pic = 'http://graph.facebook.com/' + data[i].id + '/picture';
		FB.api('/' + data[i].id + '/movies', processMovieList);
	}

	friends = data;
	alert(friends[0].pic);
}

function invite(response) {
	alert("event id: " + response.id);
	for (var i = 0; i < friends_invited.length; i++) {
		FB.api(response.id + '/invited/' + friends_invited[i], 'post', function(resp) {
			//alert(resp);
		});
	}
	
	var feed = {
			link : 'http://localhost:8080/facebook.html',
			description : 'I have created my own movie night just now! Do you want to have a try!'
	};
	
	FB.api('/me/feed', 'post', feed, function(resp) {
		alert(resp.id);
	});
	
}

function processMovieList(response) {
    movieList = movieList.concat(response.data);
    count--;
    if (count == 0) {
    	data_fetch_postproc();
    }
}

function data_fetch_postproc() {
    document.getElementById('test').innerHTML = "Generating recommendations ... " + movieList.length;
    movieList.sort(compareMovies);
    mCtr = 0;
    for (var i = 0; i < movieList.length; i++)
    {
    	var count = 0;
    	movieListSorted[mCtr] = movieList[i];
    	for (var j = i; j < movieList.length; j++) {
    		if (movieList[i].name === movieList[j].name) {
    			count++;
    		} else {
    			break;
    		}
    	}
    	i = i + count - 1;
    	movieListSorted[mCtr++].mCount = count;
    }
    
    var maxResult = 8;
    if( movieListSorted.length < maxResult) {
      maxResult = movieListSorted.length;
    } 
    movieListSorted.sort(popularMovies);
    for (var i = 0; i < maxResult; i++) {
    	getMovieInfo(movieListSorted[i].name);
    }
}
