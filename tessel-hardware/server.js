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
var rfid = rfidlib.use(tessel.port['A']); 
var rfid2 = rfidlib.use(tessel.port['B']); 


var checkout = path.join(__dirname, '/public/checkout.mp3');
var sound1 = new av.Player(checkout);

var hurry = path.join(__dirname, '/public/hurry.mp3');
var sound2 = new av.Player(hurry);

var intro = path.join(__dirname, '/public/intro.mp3');
var sound3 = new av.Player(intro);

pin.output(1);  // turn pin high (on)
//sound3.play();  // Play intro
var checkingOut = false;
var UID_data = null;

// // // check in RFID Integration test /////////////////////////////// 
// rfid2.on('ready', function (version) {
//   console.log('Ready to read check in RFID card');

//   rfid2.on('data', function(card) {
//     console.log('check in UID:', card.uid.toString('hex'));
    
//     // Need to send this to the client when swiped. 
//     //UID_data2 = card.uid.toString('hex');
//     //Then send back a chime if return successful?
//   });
// });

// rfid.on('error', function (err) {
//   console.error(err);
// });
// // //////////////////////////////////////////////////////////



io.on('connection', function(socket){
	console.log('socket connected...');
    
    // Send checked out umbrella UID to client for DB insertion
    rfid.on('data', function(card) {
      UID_data = card.uid.toString('hex');
      socket.emit('uid', { uid: UID_data });
      console.log(UID_data);
      solenoid2();
    });
 
 	// Send checked in umbrella UID to client for DB insertion
 	rfid2.on('data', function(card) {
	    console.log('check in UID:', card.uid.toString('hex'));
  	});

	socket.on('chat message', function(data){
	    console.log('message from client: ' + data.my);
	    checkout2();
    });
});

// // Socket integration test /////////////////////////////// 
// io.on('connection', function(socket){
// 	console.log('socket connected...');

// 	// Send UID to client when RFID is swiped. How? <----------------------- THIS LINE IS KEY
// 	socket.emit('uid', { uid: UID_data });

//  	socket.on('chat message', function(data){
// 	    console.log('message from client: ' + data.my);
// 	    checkout2();

// 		// Send UID to client when RFID is swiped. How?
// 		socket.emit('uid', { uid: UID_data });

//   });
// });
// //////////////////////////////////////////////////////////





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

// // Checkout TEST ///////////////////////////////////////////////////////
// app.get('/checkout2/:id', function(req, res) {
// 	console.log("checkout v2");

// 	if (req.params.id == "1") {
// 		// OK
// 		res.send('Take an umbrella');
// 		sound1.play();
// 		solenoid();  // turn pin high (on)
// 		var blink = setInterval(blinking ,500);
// 		setTimeout(function( ) { clearInterval( blink ); }, 8000);

// 		setTimeout(function(){
// 			// Hurry
// 			sound2.play();
// 			var blink = setInterval(blinking ,350);
// 			setTimeout(function( ) { clearInterval( blink ); }, 2700);
// 		}, 8000);
// 	}
// });






