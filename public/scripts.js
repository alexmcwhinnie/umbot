$(document).ready(function(){

	var socket = io.connect("http://73.94.56.102");

		socket.on('uid', function (data) {
			UID = data.uid;
	   		console.log('UID: ' + UID);
	   		//console.log('username: ' + current_user);

	  	});

	  $('.checkout').click(function() {
		console.log('button pressed');
	    socket.emit('chat message', { my: 'data, yo' });
	  });

});