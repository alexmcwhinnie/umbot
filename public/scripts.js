$(document).ready(function(){
	var socket = io.connect("http://73.94.56.102");
		socket.on('uid', function (data) {
	});

	$('.checkout').click(function() {
		console.log('button pressed');
	    socket.emit('message', { my: 'data, yo' });
	});

  	// Put status message in UI
  	socket.on('status', function (data) {
		$("#status").text(data.message);
		//wait 10 seconds and clear msg?
	});

  	// Hide by default
  	$(".fullForecast").hide();

	$('.more').click(function() {
		$(".fullForecast").show();
	});

});