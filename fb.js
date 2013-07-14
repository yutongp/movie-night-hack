var movieList = new Array();
var count;
var friends_invited = ['100006228727252'];
var friends;
var relatedMovies;
var owner = true;


function init() {
	FB.init({
        appId: '389973247769015',
        status: true, 
        cookie: true, 
        xfbml: true
    });
    FB.getLoginStatus(function(response) {
    	  if (response.status == "connected") {
    		  thisEvent.addParticipate(thisPrati);
    		  
    		  if (owner = true) {
    			  showFriendsList();
    		  }
    		  
    		  FB.api("/me", function (response) {
    			  updateParticipate(thisPrati, response);
    			  getMovies(response.id);
    			  getMovies(100006228727252);
    	      });
    	  }
    });
}


function updateParticipate(participate, data) {
	participate.name = data.name;
	participate.fbID = data.id;
	participate.photourl = 'http://graph.facebook.com/' + data.id + '/picture';
}

function showFriendsList() {
	FB.api('/me/friends', showFriend);
}

function showFriend(response) {
	var divTarget = document.getElementById("friends");
	var data = response.data;
	for (var i = 0; i < data.length; i++) {
		var divContainer = document.createElement("div");
		divContainer.innerHTML = "<img src='http://graph.facebook.com/" + data[i].id + "/picture'></img>" + data[i].name;
		divTarget.appendChild(divContainer);
		data[i].pic = 'http://graph.facebook.com/' + data[i].id + '/picture';
		//FB.api('/' + data[i].id + '/movies', processMovieList);
	}

	friends = data;
	updateFriends(thisPrati, data);
}

function updateFriends(participant, friends) {
	for (var i = 0; i < friends.length; i++) {
		var friend = new Friend();
		friend.name = friends[i].name;
		friend.fbID = friends[i].id;
		friend.photourl = 'http://graph.facebook.com/' + friends[i].id + '/picture';
		participant.addFriend(friend);
	}
	
	//alert(participant.friendList[friends[0].id].name);
}




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
			alert(response.movies[0].title);
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
		alert("Find " + response.Title);
		
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

function displayResults() {
	document.getElementById('movies').innerHTML = '';
	for (var i = 0; i < movieList.length; i++) {
		var divMovie = document.createElement("div");
		var data = thisEvent.comrecoMovies[movieList[i].alternate_ids.imdb];
		divMovie.innerHTML = data.title + "<br>" 
		+ "Country: " + data.country + "<br>"
		+ "Rating: " + data.rate + "<br>"
		+ "Genre: " + data.genre + "<br>"
		+ "Count: " + data.count + "<br><br><br>"; 
		
		document.getElementById('movies').appendChild(divMovie);
	}
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

function invite(response) {
	alert("event id: " + response.id);
	var feed = {
			//link : 'http://127.0.0.1:8080/facebook.html',
			//description : 'I have created my own movie night just now! Do you want to have a try?'
			message: '@Yutong Pei'
	};
	for (var i = 0; i < friends_invited.length; i++) {
		
	}
	
	FB.api('/me/feed', 'post', feed, function(resp) {
		alert(resp.id);
	});
	
}


