
/*
 * GET home page.
 */

var app = require('../app.js')
	, https = require('https')
	, path = require('path')
	, async = require('async');

exports.index = function(req, res){
	//TODO
	if (req.session.auth != undefined) {
		if (req.cookies.fb_accesstoken === undefined) {
			res.cookie("fb_accesstoken", req.session.auth.facebook.accessToken);
		}
		var authData = req.session.auth.facebook;
		app.fbGraphAPI(authData.user.id, 'friends', authData.accessToken,
				function(err, data) {
					console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
					app.io.sockets.in('abc123').emit("friendsList", authData.user.id, authData.accessToken, data);
				});
	} else {
		res.redirect("/auth/facebook");
	}
	res.render('index', { title: 'Movie Night' });
};
