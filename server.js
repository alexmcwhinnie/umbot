var express 	= require('express'),
	umbrellas 	= require('./routes/umbrellas');
var path    	= require("path");
var app 		= express();

app.set('views', __dirname + '/views');
app.set('view engine', 'pug');

//Routes. These are detailed in routes/umbrellas.js
app.get('/', umbrellas.count);
app.get('/test', umbrellas.count3);
// app.get('/umbrellas/:id', umbrellas.findById);

app.listen(3000);
console.log('Listening on port 3000...');