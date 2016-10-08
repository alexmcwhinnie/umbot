
var sqlite3 = require('sqlite3').verbose();
var pug = require('pug');
var db = new sqlite3.Database('umbot.db');
var async = require("async");

var current_user;
var UID;


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
      loggedInUser = null;
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



// Update activity table with checked out umbrella and user's name
function checkOutUmbrella(){
  // Query DB to find out which umbrella number the UID matches
  // db.all("SELECT COUNT(id) as cnt FROM umbrellas WHERE status='out'",
  //   function(err, rows){
  //     outCount=rows[0].cnt;
  //     console.log("Umbrellas Out: " + outCount);
  // });

  var umbrella_out = 2; // <---this needs to be dynamic
  var stmt = db.prepare("INSERT INTO activity_log VALUES (null, datetime('now', 'localtime'), ?, ?, ?)");
          stmt.run('Out', umbrella_out, current_user);
      stmt.finalize();
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
