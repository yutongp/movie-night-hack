allEvent = {};

require('../server_app/data');
exports.actions = function(req, res, ss) {

	// Example of pre-loading sessions into req.session using internal middleware
	req.use('session');
	var query = require('url').parse(req.url,true).query;
	console.log(query);


	return {
		joinEvent: function (eventID) {
			var thisEvent = eventMap[eventID];
			//thisEvent.add(player.name, player.color);
			//req.session.channel.subscribe(eventID);
			//req.session.setUserId(player.name);
			//ss.publish.channel(roomNumber, 'newPlayerIn', player);
		},

		

	};
};
