// Required Packages
var tessel = require('tessel');
var rfidlib = require('rfid-pn532');

// Set up
var rfid = rfidlib.use(tessel.port['A']); 
var pin1 = tessel.port.A.pin[4]; // select pin 2 on port A
var pin2 = tessel.port.A.pin[5]; // select pin 2 on port A

// LED from UI
pin1.output(1);  // turn pin high (on)
pin2.output(1);  // turn pin high (on)


// RFID Part
rfid.on('ready', function (version) {
  console.log('Ready to read RFID card');

  rfid.on('data', function(card) {
    console.log('UID:', card.uid.toString('hex'));
  });
});

rfid.on('error', function (err) {
  console.error(err);
});