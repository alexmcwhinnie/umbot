
var sqlite3 = require('sqlite3').verbose();
var pug = require('pug');
var db = new sqlite3.Database('umbot.db');
var async = require("async");
var socket = require('socket.io-client')('http://73.94.56.102');

var current_user;
var UID;
var umbrella_out;

getUID();

	// //Get Count of Umbrellas In
	// db.all("SELECT COUNT(id) as cnt FROM umbrellas WHERE status='in'",
	//   function(err, rows){
	//     inCount=rows[0].cnt;
	//     console.log("Umbrellas In: " + inCount);
	// });

	// //Get Count of Umbrellas Out
	// db.all("SELECT COUNT(id) as cnt FROM umbrellas WHERE status='out'",
	//   function(err, rows){
	//     outCount=rows[0].cnt;
	//     console.log("Umbrellas Out: " + outCount);
	// });

// exports.count = function(req, res) {

// 	//Get Count of Umbrellas In
// 	db.all("SELECT COUNT(id) as cnt FROM umbrellas WHERE status='in'",
// 	  function(err, rows){
// 	    inCount=rows[0].cnt;
// 	    console.log("Umbrellas In: " + inCount);
// 	});

// 	//Get Count of Umbrellas Out
// 	db.all("SELECT COUNT(id) as cnt FROM umbrellas WHERE status='out'",
// 	  function(err, rows){
// 	    outCount=rows[0].cnt;
// 	    console.log("Umbrellas Out: " + outCount);
// 	});
    
//     //Render Count
// 	res.render('count', { _incount: inCount + ' in', _outcount: outCount + ' out'});

// };


// exports.count2 = function(req, res) {

// 	async.series([
// 	    function(){
// 	    	//Get Count of Umbrellas In
// 		db.all("SELECT COUNT(id) as cnt FROM umbrellas WHERE status='in'",
// 		  function(err, rows){
// 		    inCount=rows[0].cnt;
// 		    console.log("Umbrellas In: " + inCount);
// 		});

// 		//Get Count of Umbrellas Out
// 		db.all("SELECT COUNT(id) as cnt FROM umbrellas WHERE status='out'",
// 		  function(err, rows){
// 		    outCount=rows[0].cnt;
// 		    console.log("Umbrellas Out: " + outCount);
// 		});
// 	    },
// 	    function(){
// 	    	res.render('count', { _incount: inCount + ' in', _outcount: outCount + ' out'});
// 		}
// 	]);

// };

// exports.count = function(req, res) {

// 	db.serialize(function() {
// 	    //Get Count of Umbrellas In
// 		db.all("SELECT COUNT(id) as cnt FROM umbrellas WHERE status='in'", function(err, rows){
// 		    inCount=rows[0].cnt;
// 		    console.log("Umbrellas In: " + inCount);

// 	    }, function() {
// 	        // All done fetching records, render response
// 	        res.render('count', { _incount: inCount + ' in', _outcount: outCount + ' out'});
// 	    });
// 	});
// };

exports.hardware = function(req, res) {
  
};

exports.dashboard = function(req, res) {

var inCount;
var outCount;


  async.parallel([
    function (callback) {

      //Get in count
      db.get("SELECT COUNT(id) as cnt FROM umbrellas WHERE status='in'", callback);
    },
    function (callback) {

      //Get out count
      db.get("SELECT COUNT(id) as cnt FROM umbrellas WHERE status='out'", callback);
    }
  ], function (error, results) {

    if (error) {
      console.log('error');
      //loggedInUser = null;
    } else {
      res.render('dashboard', { _incount: results[0].cnt + ' in', _outcount: results[1].cnt + ' out'});
      console.log(inCount);
      console.log(results[1]);

      if (req.user) {
        current_user = req.user.email;
      // get logged in user test
      // only do this if RFID code positive.

        checkOutUmbrella();
        console.log('db should have been updated to show '+ current_user + ' checked out an umbrella ' + UID);
    } else {
      console.log('no one logged in');
    }
    }
  })
};


exports.count = function(req, res) {

var inCount;
var outCount;

  async.parallel([
    function (callback) {

      //Get in count
      db.get("SELECT COUNT(id) as cnt FROM umbrellas WHERE status='in'", callback);
    },
    function (callback) {

      //Get out count
      db.get("SELECT COUNT(id) as cnt FROM umbrellas WHERE status='out'", callback);
    }
  ], function (error, results) {

    if (error) {
      console.log('error');
    } else {
      res.render('count', { _incount: results[0].cnt + ' in', _outcount: results[1].cnt + ' out'});
      console.log(inCount);
      console.log(results[1]);


    }
  })
};



exports.log = function(req, res, next) {

  db.all('SELECT * FROM activity_log ORDER BY id DESC', function(err, row) {
    if(err !== null) {
      //Next err is middleware? 
      next(err);
    }
    else {
    	//Looks like Node sends this as an object array? Will pick it apart in Pug
    	res.render('log', {logrow: row});
    }
  });
};


function getUser() {
  current_user = req.user.email;
}

// Update activity table with checked out umbrella and user's name
function checkOutUmbrella(){
  
  // Do we have a current user?
  console.log(current_user);

  // Match the UID to the umbrella ID
  db.all("SELECT * FROM umbrellas", function(err, umbrella){
    for(i = 0; i < 4; i++) {
      if (umbrella[i].uid == UID) {  
        umbrella_out = umbrella[i].id
        console.log(umbrella_out);

        // If umbrella is in, do the following
        if (umbrella[i].status == 'IN') {

          //Print pre-log umbrella status to console
          console.log("umbrella " + umbrella[i].id + " has a status of " + umbrella[i].status);

          //enter activity line in activity log table
          var stmt = db.prepare("INSERT INTO activity_log VALUES (null, datetime('now', 'localtime'), ?, ?, ?)");
          stmt.run('OUT', umbrella_out, current_user);
          stmt.finalize();
          console.log("umbrella activity log updated");

          //update umbrella status to 'out' in umbrellas table
          var stmt2 = db.prepare("UPDATE umbrellas SET status = 'OUT' WHERE id = " + umbrella_out);
          stmt2.run();
          stmt2.finalize();
          console.log("umbrella table updated");     

        }
      }
    }    
  });
}

// Update activity table with checked in umbrella and user's name
function checkInUmbrella(){
}

exports.checkout = function(req, res, next) {


  var current_user = 'Alex';
  var umbrella_out = 2;

  var stmt = db.prepare("INSERT INTO activity_log VALUES (null, datetime('now', 'localtime'), ?, ?, ?)");
          stmt.run('In', umbrella_out, current_user);
        
      stmt.finalize();

      //also need to update umbrellas table with status of umbrella

};

exports.weather = function(req, res, next) {

  //https://www.npmjs.com/package/forecast
  //https://developer.forecast.io/docs/v2

  // Require the module 
  var Forecast = require('forecast');
   
  // Initialize 
  var forecast = new Forecast({
    service: 'forecast.io',
    key: '4e777bbb1f972c436be40b9bacb59bf7',
    units: 'f', // Only the first letter is parsed 
    cache: true,      // Cache API requests? 
    ttl: {            // How long to cache requests. Uses syntax from moment.js: http://momentjs.com/docs/#/durations/creating/ 
      minutes: 5,
      seconds: 0
      }
  });
   
  // Retrieve weather information from coordinates (Sydney, Australia) 
  forecast.get([44.9778, -93.2650], function(err, weather) {
    if(err) return console.dir(err);
    var summary = weather.hourly.summary;
    var temp = weather.currently.temperature;
    var precipProbability = weather.currently.precipProbability;
    var nearestStormDistance = weather.currently.nearestStormDistance;
    console.log("Summary: " + summary);
    console.log("Current Temperature: " + temp);
    console.log("Precipitation Probability: " + precipProbability + "%");
    console.log("Nearest Storm Distance: " + nearestStormDistance + " miles");

    res.render('weather', {_temp: temp, _summary: summary, _precip: precipProbability, _storm: nearestStormDistance,});
  });
   
  // // Retrieve weather information, ignoring the cache 
  // forecast.get([44.9778, -93.2650], true, function(err, weather) {
  //   if(err) return console.dir(err);
  //   console.dir(weather);
  // });
};



function getUID() {
  // Get UID from checkout reader
  socket.on('connect', function(){});
  // IN
  socket.on('uid', function(data){
    var UID_data = data.uid;
    var UID_split = UID_data.split('@');
    UID = UID_split[1];

    if (UID_split[0] == 'in') {
      //DO CHECKIN STUFF
      console.log('UID in: ' + UID);
    }

    if (UID_split[0] == 'out') {
      //DO CHECKOUT STUFF
      checkOutUmbrella();
      console.log('UID out: ' + UID);
    }

  });

  // // OUT
  // socket.on('uid-out', function(data){
  //   UID = data.uidout;

  //   //if UID indicates checked out- do following
  //   console.log('UID OUT: ' + UID);

  // });

  socket.on('disconnect', function(){});
  ///////////////////////////////////////
}
