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



	// Try to add weather icons
	// var skycons = new Skycons({"color": "black"});
 //  // on Android, a nasty hack is needed: {"resizeClear": true}

 //  // you can add a canvas by it's ID...
 //  skycons.add("icon", Skycons.RAIN);

 //  // start animation!
 //  skycons.play();

});