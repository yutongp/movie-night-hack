var socket = io.connect('http://127.0.0.1:8080');
// let's assume that the client page, once rendered, knows what room it wants to join
var room = "abc123";

socket.on('connect', function() {
	// Connected, let's sign-up for to receive messages for this room
	socket.emit('room', room);
});

socket.on('message', function(data) {
	console.log('Incoming message:', data);
});

socket.on('friendsList', function(id, token, data) {
	console.log('Incoming message:', data[10]);
	socket.emit('invitedFriends', id, token, [data[10]]);
});
