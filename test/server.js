var tessel = require('tessel'); // import tessel
var av = require('tessel-av');
var sqlite = require('sqlite3');
// var pug = require('pug');
var stormpath = require('express-stormpath');
var path = require('path');
var bodyParser = require('body-parser');
var express 	= require('express');
var app 		= express();


var test = 'ABCDEFGHIJ';
var pin = tessel.port.A.pin[4];
var pin2 = tessel.port.A.pin[5];

pin.output(1);  // turn pin high (on)
//pin2.output(1);  // turn pin high (on)

var checkout = path.join(__dirname, '/public/checkout.mp3');
var sound1 = new av.Player(checkout);

var hurry = path.join(__dirname, '/public/hurry.mp3');
var sound2 = new av.Player(hurry);


app.get('/', function (req, res) {
  res.send('Hardware Online! Port Fowarding from Time Capsule Working');
  pin.output(0);  // turn pin high (off)
});

// Blink
function blinking(){
  pin.toggle();
};

// UNLOCK
function solenoid(){
  pin2.output(1);
};

// LOCK
function solenoid2(){
  pin2.output(0);
};

// Checkout
app.get('/checkout', function(req, res) {
console.log("checkout v1");
  // OK
  res.send('Take an umbrella');
  sound1.play();
  solenoid();  // turn pin high (on)
  var blink = setInterval(blinking ,500);
  setTimeout(function( ) { clearInterval( blink ); }, 8000);

  setTimeout(function(){
    // Hurry
    sound2.play();
    var blink = setInterval(blinking ,350);
    setTimeout(function( ) { clearInterval( blink ); }, 2700);
  }, 8000);
  // Lock
  setTimeout(function(){
    solenoid2();
  }, 10700);
});

app.listen(80, function () {
  console.log('Hardware Online');
});

// Checkout TEST ///////////////////////////////////////////////////////
app.get('/checkout2/:id', function(req, res) {
  console.log("checkout v2");

  if (req.params.id == "1") {
    // OK
    res.send('Take an umbrella');
    sound1.play();
    solenoid();  // turn pin high (on)
    var blink = setInterval(blinking ,500);
    setTimeout(function( ) { clearInterval( blink ); }, 8000);

    setTimeout(function(){
      // Hurry
      sound2.play();
      var blink = setInterval(blinking ,350);
      setTimeout(function( ) { clearInterval( blink ); }, 2700);
    }, 8000);
  }
});

