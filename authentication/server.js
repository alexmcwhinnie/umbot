var express = require('express');
var stormpath = require('express-stormpath');
var path = require('path');

var app = express();
app.set('views', './views');
app.set('view engine', 'jade');

// Stormpath init and custom view control //////////////////////////////////////////
app.use(stormpath.init(app, {
  web: {
  	register: {
  		view: path.join(__dirname,'views','register.jade'), // My custom register view
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
      view: path.join(__dirname,'views','login.jade') // My custom login view
    },
    forgotPassword: {
      enabled: true,
      uri: "/forgot",
      view: path.join(__dirname,'views','forgot-password.jade'), // My custom login view
      nextUri: "/login?status=forgot"
    }
  }
}));
//////////////////////////////////////////////////////////////////////////////////


app.get('/', stormpath.getUser, function(req, res) {
  res.render('home', {
    title: 'Welcome'
  });
});

app.on('stormpath.ready',function(){
  console.log('Stormpath Ready');
});

app.listen(3000);