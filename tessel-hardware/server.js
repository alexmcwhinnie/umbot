// REQUIRE MODULES ///////////////////////////////////////////////////////////////////////////////
var tessel = require('tessel'); 		// Tessel
var av = require('tessel-av'); 			// Tessel AV module
var path = require('path');				// Path Module
var app = require('express')();			// Express webserver
var http = require('http').Server(app);	// HTTP server
var io = require('socket.io')(http);	// Socket IO
var rfidlib = require('rfid-pn532');	// Tessel RFID module
//////////////////////////////////////////////////////////////////////////////////////////////////

// SET UP ////////////////////////////////////////////////////////////////////////////////////////
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// SET TESSEL PINS
var pin = tessel.port.A.pin[4];					// GREEN LED
var pin2 = tessel.port.A.pin[5];				// Solenoid
var pin3 = tessel.port.B.pin[4]; 				// RED LED
var rfid_out = rfidlib.use(tessel.port['A'],	// RFID OUT reader
	{
		listen: true, 	// Auto read
		delay: 3000		// After reading add delay
	}
); 

var rfid_in = rfidlib.use(tessel.port['B'],		// RFID In reader
	{
	    listen: true, 	// Auto read
	    delay: 3000		// After reading add delay
 	}
); 

// SET AUDIO (Files included with .tesselinclude)
var checkout = path.join(__dirname, '/public/checkout.mp3');
var sound_checkout = new av.Player(checkout);

var hurry = path.join(__dirname, '/public/hurry.mp3');
var sound_hurry = new av.Player(hurry);

var intro = path.join(__dirname, '/public/intro.mp3');
var sound_intro = new av.Player(intro);

var deny = path.join(__dirname, '/public/deny2.mp3');
var sound_deny = new av.Player(deny);

var checkin = path.join(__dirname, '/public/checkin.mp3');
var sound_checkin = new av.Player(checkin);

// SET INITIAL VALUES
pin.output(1);  // turn Boot LED on
//sound_intro.play();  // Play intro tune
var checkingOut = false;
var UID_data = null;
var runOnce = true;
var positiveStatus = 'Take your umbrella';
var negativeStatus = 'You already have an umbrella';
//var locked = true;

// Checkout Timeout variables. Used for terminating checkout sequence from outside of function
// NOTE: RFID out-reader signals checkout sequence to end
var takeUmbrella;
var blink;
var timeOut;
var reLock;

//////////////////////////////////////////////////////////////////////////////////////////////////

function lock() {
	solenoid2();
	
	// Prematurely terminate checkout sequence
	clearTimeout(takeUmbrella);
	clearInterval(blink);
	clearTimeout(timeOut);
	clearTimeout(reLock);

	// Because checkout/timeout sequence is prematurely terminated when the lock function is called, this needs to be called here.
	checkingOut = false;
}

io.on('connection', function(socket){
	console.log('socket connected...');
    
    // Send checked out umbrella UID to client (scripts.js) for DB insertion
    rfid_out.on('data', function(card) {
      UID_data = 'out@'+card.uid.toString('hex');
      socket.emit('uid', { uid: UID_data });
      console.log(UID_data);
      sound_checkin.play();
      lock();
      //solenoid2();
    });
 
 	// Send checked in umbrella UID to client for DB insertion
 	rfid_in.on('data', function(card) {
 		UID_data = 'in@'+card.uid.toString('hex');
      socket.emit('uid', { uid: UID_data });
      console.log(UID_data);
      sound_checkin.play();
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
	    	io.emit('status', { message: negativeStatus });
	    	denyUmbrella();
	    } else if (data.unlock == 'true') {
	    	io.emit('status', { message: positiveStatus });
	    	checkout3(); // Call checkout function
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

// Blink
function redBlink(){
	pin3.toggle();
};

// ERROR (User already has umbrella)
function denyUmbrella(){
	pin.output(0);  // turn GREEN LED off

	// Play deny tune
	sound_deny.play();

	if (runOnce == true) {
		runOnce = false;
		// Blink RED LED for 4 seconds
		var blink = setInterval(redBlink ,100);
		setTimeout(function( ) { clearInterval( blink ); }, 4000);

		// Reset LEDs to waiting state
		setTimeout(function(){
			pin.output(1);  // Turn GREEN LED on
			pin3.output(0);  // Turn RED LED off
			runOnce = true;
		}, 4000);
	}
};

// function checkout() {
// 	sound_checkout.play();
// 	solenoid();  // turn pin high (on)
// 	var blink = setInterval(blinking ,500);
// 	setTimeout(function( ) { clearInterval( blink ); }, 8000);

// 	setTimeout(function(){
// 		// Hurry
// 		sound_hurry.play();
// 		var blink = setInterval(blinking ,350);
// 		setTimeout(function( ) { clearInterval( blink ); }, 2700);
// 	}, 8000);
// 	// Lock
// 	setTimeout(function(){
// 		solenoid2();
// 	}, 10700);
// }

function checkout2() {
	if (checkingOut == false) {
		checkingOut = true;
		sound_checkout.play();
		solenoid();  // turn pin high (on)
		var blink = setInterval(blinking ,500);
		setTimeout(function( ) { clearInterval( blink ); }, 8000);
		
		// Only do time out if user hasn't taken umbrella
		// if (locked == false) {
			setTimeout(function(){
				// Hurry
				sound_hurry.play();
				var blink = setInterval(blinking ,350);
				setTimeout(function( ) { clearInterval( blink ); }, 2700);
			}, 8000);
			// Lock
			setTimeout(function(){
				solenoid2();
				checkingOut = false;
			}, 10700);
		// }
	}
}

// function checkOutSequence() {
// 	setTimeout(function() { clearInterval( blink ); }, 8000);
// 	setTimeout(function(){
// 		// Hurry
// 		sound_hurry.play();
// 		var blink = setInterval(blinking ,350);
// 		setTimeout(function( ) { clearInterval( blink ); }, 2700);
// 	}, 8000);
// 	// Lock
// 	setTimeout(function(){
// 		solenoid2();
// 		checkingOut = false;
// 	}, 10700);
// }


function checkout3() {
	if (checkingOut == false) {
		checkingOut = true;

		
			sound_checkout.play();
			solenoid();  // turn pin high (on)
			blink = setInterval(blinking ,500);
			takeUmbrella = setTimeout(function( ) { clearInterval( blink ); }, 8000);
			
			// Only do time out if user hasn't taken umbrella
			// if (locked == false) {
			timeOut = setTimeout(function(){
				// Hurry
				sound_hurry.play();
				blink = setInterval(blinking ,350);
				setTimeout(function( ) { clearInterval( blink ); }, 2700);
			}, 8000);
			// Lock
			reLock = setTimeout(function(){
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


// // Checkout
// app.get('/checkout', function(req, res) {
// console.log("checkout v1");
// 	// OK
// 	res.send('Take an umbrella');
// 	sound_checkout.play();
// 	solenoid();  // turn pin high (on)
// 	var blink = setInterval(blinking ,500);
// 	setTimeout(function( ) { clearInterval( blink ); }, 8000);

// 	setTimeout(function(){
// 		// Timeout
// 		sound_hurry.play();
// 		var blink = setInterval(blinking ,350);
// 		setTimeout(function( ) { clearInterval( blink ); }, 2700);
// 	}, 8000);
// 	// Lock
// 	setTimeout(function(){
// 		solenoid2();
// 	}, 10700);
// });

http.listen(80, function () {
  console.log('Hardware Online');
});







