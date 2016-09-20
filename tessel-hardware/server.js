var tessel = require('tessel'); // import tessel
var av = require('tessel-av');
var path = require('path');
var express 	= require('express');
var app 		= express();

var test = 'ABCDEFGHIJ';
var pin = tessel.port.A.pin[4];
pin.output(1);  // turn pin high (on)

var checkout = path.join(__dirname, '/public/checkout.mp3');
var sound1 = new av.Player(checkout);

var hurry = path.join(__dirname, '/public/hurry.mp3');
var sound2 = new av.Player(hurry);

// Landing
app.get('/', function (req, res) {
  res.send('Hardware Online! Port Fowarding from Time Capsule Working');
  pin.output(0);  // turn pin high (off)
});

// Checkout
app.get('/checkout', function(req, res) {

	// OK
	res.send('Take an umbrella');
	sound1.play();
	var blink = setInterval(blinking ,500);
	setTimeout(function( ) { clearInterval( blink ); }, 7500);

	setTimeout(function(){
		// Hurry
		sound2.play();
		var blink = setInterval(blinking ,350);
		setTimeout(function( ) { clearInterval( blink ); }, 2700);
	}, 7500);
});









