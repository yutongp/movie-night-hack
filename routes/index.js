
/*
 * GET home page.
 */

var app = require('../app.js')
  , https = require('https')
  , path = require('path')
  , async = require('async')
  , mongoose = require('mongoose');

exports.index = function(req, res){
  //TODO
  if (req.session.auth) {
    if (!req.cookies.fb_accesstoken) {
      res.cookie("fb_accesstoken", req.session.auth.facebook.accessToken);
      res.cookie("fb_id", req.session.auth.facebook.user.id);
    }
    var User = mongoose.model('User');
    User
      .findOne({fbID: req.session.auth.facebook.user.id})
      .populate('joinedEvents')
      .exec(function(err, user){
        var opts = {
            path: 'joinedEvents.host.id'
        }
        User.populate(user, opts, function (err, docs) {
          console.log('dd',err);
          console.log('xx',docs);
        })
          console.log("dddddddddddd", user.joinedEvents);
          res.render('index', { title: 'Movie Night', events: user.joinedEvents });
       });
  } else {
    if (req.cookies.fb_accesstoken) {
      res.redirect("/auth/facebook");
    }
    res.render('index', { title: 'Movie Night' });
  }
};


var logIn = function (fbData) {
  User.findOne({fbID: fbData.user.id}, function(err, user){
    if (user) {
      console.log("User exist:", user);
    } else {
      console.log("Create New User");
      var user = new User ({
        name: fbData.user.name
        , firstName: fbData.user.first_name
        , lastName: fbData.user.last_name
        , fbID: fbData.user.id
        , username: fbData.user.username
        , profileImage: 'http://graph.facebook.com/' + fbData.user.id + '/picture'
        });
      user.save(function(err){
        //TODO update movie
      });
    }
  });
}

exports.createEvent = function (req, res) {
  var User = mongoose.model('User');
  var fbData = req.session.auth.facebook;
  User.findOne({fbID: fbData.user.id}, function(err, user){
    if (user) {
      console.log("User exist:", user);
      var Event = mongoose.model('Event');
      console.log("Create Event");
      var thisEvent = new Event ({
        users: [user._id]
        , host: {name: user.name, id: user._id}
      });
      thisEvent.save(function(err, thisEvent){
        user.joinedEvents.push(thisEvent._id);
        console.log("DDDDDD", user.joinedEvents);
        user.save();
        res.redirect('/event/' + thisEvent._id, { RECOMMANDNUM: 8 });
        //TODO update movie
      });
    } else {
      res.redirect("/auth/facebook");
    }
  });
};

exports.event = function (req, res) {
  //if (req.session.auth) {
    //if (!req.cookies.fb_accesstoken) {
      //res.cookie("fb_accesstoken", req.session.auth.facebook.accessToken);
    //}
    //var authData = req.session.auth.facebook;
    ////app.fbGraphAPI(authData.user.id, 'friends', authData.accessToken,
    ////function(err, data) {
    ////app.io.sockets.in('abc123').emit("friendsList", authData.user.id, authData.accessToken, data);
    ////});
  //} else {
    //res.redirect("/auth/facebook");
  //}
  res.render('event', { title: 'Movie Night', RECOMMANDNUM: 8,
  genres: ['Action', 'Adventure', 'Drama', 'Comedy']});
};
