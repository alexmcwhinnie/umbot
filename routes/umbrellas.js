
var sqlite3 = require('sqlite3').verbose();
var pug = require('pug');
var db = new sqlite3.Database('umbot.db');
var async = require("async");




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



exports.checkout = function(req, res, next) {


  var current_user = 'Alex';
  var umbrella_out = 2;

  var stmt = db.prepare("INSERT INTO activity_log VALUES (null, datetime('now', 'localtime'), ?, ?, ?)");
          stmt.run('In', umbrella_out, current_user);
        
      stmt.finalize();

      //also need to update umbrellas table with status of umbrella

};

