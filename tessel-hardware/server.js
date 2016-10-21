var tessel = require('tessel'); // import tessel
var av = require('tessel-av');
var path = require('path');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var rfidlib = require('rfid-pn532');

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

var test = 'ABCDEFGHIJ';
var pin = tessel.port.A.pin[4];
var pin2 = tessel.port.A.pin[5];
var pin3 = tessel.port.B.pin[4]; //RED
var rfid = rfidlib.use(tessel.port['A']); 
var rfid2 = rfidlib.use(tessel.port['B']); 



var checkout = path.join(__dirname, '/public/checkout.mp3');
var sound1 = new av.Player(checkout);

var hurry = path.join(__dirname, '/public/hurry.mp3');
var sound2 = new av.Player(hurry);

var intro = path.join(__dirname, '/public/intro.mp3');
var sound3 = new av.Player(intro);

pin.output(1);  // turn Boot LED on
//sound3.play();  // Play intro tune
var checkingOut = false;
var UID_data = null;


io.on('connection', function(socket){
	console.log('socket connected...');
    
    // Send checked out umbrella UID to client (scripts.js) for DB insertion
    rfid.on('data', function(card) {
      UID_data = 'out@'+card.uid.toString('hex');
      socket.emit('uid', { uid: UID_data });
      console.log(UID_data);
      solenoid2();
    });
 
 	// Send checked in umbrella UID to client for DB insertion
 	rfid2.on('data', function(card) {
 		UID_data = 'in@'+card.uid.toString('hex');
      socket.emit('uid', { uid: UID_data });
      console.log(UID_data);
  	});

 	// LISTEN TO SCRIPTS.JS & SEND REQUEST TO UMBRELLAS.JS FOR MULTIPLE UMBRELLA DB CHECK
	socket.on('message', function(data){

		// Optional message coming from scripts.js
	    if (data.my == 'data, yo') { 
	    	console.log("request to unlock receptacle from scripts.js client");

	    	// Tell umbrellas.js that someone has requested an umbrella
	    	io.emit('test', { test: 'checkout' });
	    } 
	    // // Error for trying to check out a second umbrella. Coming from umbrellas.js
	    // if (data.error1 == 'error, yo') {
	    // 	console.log('errors! red light');

	    // } else {
	    // 	// If there were no errors, fire checkout function
	    // 	//checkout2();
	    // }

    });

	// UNLOCK OR NOT
    socket.on('status', function(data){

		// Optional message coming from scripts.js
	    if (data.unlock == 'false') { 
	    	console.log("stay locked, RED LED");
	    	pin3.output(1);  // turn RED LED on
	    	pin1.output(0);  // turn GREEN LED off
	    } else if (data.unlock == 'true') {
	    	checkout2();
	    	console.log('unlock/checkout');
	    }

    });
});


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

function checkout() {
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
}

function checkout2() {
	if (checkingOut == false) {
		checkingOut = true;
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
			checkingOut = false;
		}, 10700);
		
	}
}

// function endCheckout() {
// 	setTimeout(function(){
// 		// Hurry
// 		setTimeout(function( ) { clearInterval( blink );
// 	 };
// }


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

http.listen(80, function () {
  console.log('Hardware Online');
});







