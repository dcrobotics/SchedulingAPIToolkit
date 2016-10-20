//var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bcrypt = require('bcrypt-nodejs');
var path = require('path');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var nunjucks = require('nunjucks');
var cors = require('cors');

var route = require('./route.js');

// Auth modules
var authRoute = require('./authRoute');
var model = require('./model');

const WS_PORT = 8080;
var webServer = express();

var whitelist = ['https://waybright.com', 'https://waybright.com/'];
var corsOptions = {
 origin: function(origin, callback){
   var originIsWhitelisted = whitelist.indexOf(origin) !== -1;
   callback(null, originIsWhitelisted);
 }
};



// Setup Nunjucks
nunjucks.configure('views', {
    autoescape: true,
    express: webServer
});

// Setup Passport
passport.use(new LocalStrategy(function(username, password, done) {
   new model.User({username: username}).fetch().then(function(data) {
      var user = data;
      if(user === null) {
         return done(null, false, {message: 'Invalid username or password'});
      } else {
         user = data.toJSON();
         if(!bcrypt.compareSync(password, user.password)) {
            return done(null, false, {message: 'Invalid username or password'});
         } else {
            return done(null, user);
         }
      }
   });
}));

passport.serializeUser(function(user, done) {
  done(null, user.username);
});

passport.deserializeUser(function(username, done) {
   new model.User({username: username}).fetch().then(function(user) {
      done(null, user);
   });
});

webServer.set('port', process.env.PORT || WS_PORT);
webServer.use(cors(corsOptions));
webServer.use(cookieParser());
webServer.use(bodyParser.urlencoded({extended: true}));
webServer.use(bodyParser.json());

webServer.use(session({ secret: 'secret strategic xxzzz code', resave: true, saveUninitialized: true }));
webServer.use(passport.initialize());
webServer.use(passport.session());

webServer.get('^\/$', authRoute.index);
// signin
webServer.get('^\/signin\/?$', authRoute.signIn);
webServer.post('^\/signin\/?$', authRoute.signInPost);

// signup
webServer.get('^\/signup\/?$', authRoute.signUp);
webServer.post('^\/signup\/?$', authRoute.signUpPost);
// logout
webServer.get('^\/signout\/?$', authRoute.signOut);

/********************************/
// API Routes
webServer.get('^\/wp|^\/ee|^\/report|^\/refresh\/?$', route.apiRoute );
/********************************/

// 404 not found
//webServer.use(route.notFound404);
webServer.use(route.notFound404);

webServer.listen(webServer.get('port'), function(err) {
  if(err) throw err;
  console.log('WB API server listening on port ' + WS_PORT);
});
// *************************************************************************//
