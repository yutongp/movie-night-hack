var app = require('../app.js')
  , https = require('https')
  , path = require('path')
  , async = require('async')
  , mongoose = require('mongoose');

exports.getEvent = function(req, res){
  //TODO add authecation
    var Event = mongoose.model('Event');
    Event
      .findById(mongoose.Types.ObjectId(req.params.eventID))
      .populate('users')
      .exec(function(err, event){
        console.log(err);
        console.log(event);
        if (err) {
          //TODO add error controll
        }
          res.send(event.toJSON());
       });
};
