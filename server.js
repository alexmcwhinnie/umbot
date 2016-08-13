var express 	= require('express'),
	umbrellas 	= require('./routes/umbrellas');
var path    	= require("path");
var app 		= express();

app.set('views', __dirname + '/views');
app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));

//Routes. These are detailed in routes/umbrellas.js
app.get('/', umbrellas.count);
app.get('/log', umbrellas.log);
app.get('/checkout', umbrellas.checkout);
//app.get('/signup', umbrellas.signup);
//app.get('/login', umbrellas.login);
//app.get('/404', umbrellas.404);
// app.get('/umbrellas/:id', umbrellas.findById);

app.listen(3000);
console.log('Listening on port 3000...');