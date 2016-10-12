$(document).ready(function(){
	var socket = io.connect("http://73.94.56.102");
		//do i need the socket on?
		socket.on('uid', function (data) {
			// UID = data.uid;
	  		// console.log('UID from scripts: ' + UID);

	  	});

	  $('.checkout').click(function() {
		console.log('button pressed');
	    socket.emit('chat message', { my: 'data, yo' });
	  });

});