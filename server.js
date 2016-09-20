var express 	= require('express'),
	umbrellas 	= require('./routes/umbrellas');
var path    	= require('path');
var stormpath = require('express-stormpath');
var pug = require('pug');
var app 		= express();


app.set('views', __dirname + '/views');
app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));

//Routes. These are detailed in routes/umbrellas.js
//app.get('/', umbrellas.count);
app.get('/log', umbrellas.log);
app.get('/weather', umbrellas.weather);
app.get('/checkout', umbrellas.checkout);
app.get('/hardware', umbrellas.hardware);
//app.get('/signup', umbrellas.signup);
//app.get('/login', umbrellas.login);
//app.get('/404', umbrellas.404);
// app.get('/umbrellas/:id', umbrellas.findById);



//NEW

// Stormpath init and custom view control //////////////////////////////////////////
app.use(stormpath.init(app, {
  web: {
  	register: {
  		view: path.join(__dirname,'views','register.pug'), // My custom register view
	    autoLogin: true,
	    nextUri: '/',
	    form: {
		    fields: {
		        givenName: {
		          enabled: false
		        },
		        surname: {
		          enabled: false
		        }
	    	}
      	}
  	},
  	login: {
      view: path.join(__dirname,'views','login.pug') // My custom login view
    },
    forgotPassword: {
      enabled: true,
      uri: "/forgot",
      view: path.join(__dirname,'views','forgot-password.pug'), // My custom login view
      nextUri: "/login?status=forgot"
    }
  }
}));
//////////////////////////////////////////////////////////////////////////////////


app.get('/', stormpath.getUser, umbrellas.dashboard, function(req, res) {
  res.render('dashboard', {
    title: 'Welcome'
  });
});

app.on('stormpath.ready',function(){
  console.log('Umbot Ready');
});

app.listen(3000);