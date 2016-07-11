//var http = require('http');
var express = require('express');
var url  = require('url');
var WP   = require('wpapi');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bcrypt = require('bcrypt-nodejs');
var ejs = require('ejs');
var path = require('path');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var util              = require('./util.js');
var auth              = require('./auth.js');
var wpRequestHandlers = require('./wpRequestHandlers.js');
var eeRequestHandlers = require('./eeRequestHandlers.js');

// Auth modules
var route = require('./route');
var Model = require('./model');


// Create the wpapi JSON objects on startup
const DATA_SITE = 'https://desertcommunityrobotics.com/'
const WP_JSON_HEAD = 'wp-json/'
var wpEp = new WP({ endpoint: DATA_SITE + WP_JSON_HEAD,
                    username: auth.WP_JSON_USER,
                    password: auth.WP_JSON_PASS
                 });
var wpEpDiscovery = WP.discover( DATA_SITE );
// Export the wpapi hierarchy
exports.DATA_SITE     = DATA_SITE;
exports.WP_JSON_HEAD  = WP_JSON_HEAD;
exports.wpEp          = wpEp;
exports.wpEpDiscovery = wpEpDiscovery;

const WS_PORT = 8080;
var webServer = express();

// Setup Passport
passport.use(new LocalStrategy(function(username, password, done) {
   new Model.User({username: username}).fetch().then(function(data) {
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
   new Model.User({username: username}).fetch().then(function(user) {
      done(null, user);
   });
});
webServer.set('port', process.env.PORT || WS_PORT);
webServer.set('views', path.join(__dirname, 'views'));
webServer.set('view engine', 'ejs');
webServer.use(cookieParser());
webServer.use(bodyParser.urlencoded({extended: true}));
webServer.use(bodyParser.json());

webServer.use(session({ secret: 'secret strategic xxzzz code', resave: true, saveUninitialized: true }));
webServer.use(passport.initialize());
webServer.use(passport.session());

webServer.get('/', route.index);

// signin
webServer.get('/signin/?', route.signIn);
webServer.post('/signin/?', route.signInPost);

// signup
webServer.get('/signup/?', route.signUp);
webServer.post('/signup/?', route.signUpPost);
// logout
webServer.get('/signout/?', route.signOut);

/********************************/
// API Routes
// /reresh route
webServer.get('/refresh/?',function(req, rsp, next) {
  if( !req.isAuthenticated() ) {
    route.notFound404(req, rsp, next);
  } else {
    wpEpDiscovery = WP.discover( DATA_SITE );
    util.sendResponse(rsp, util.contType.TEXT, 'Discovery data has been refreshed.' );
  }
});

// Wordpress default REST API
webServer.get('/wp(/*)?',function(req, rsp, next) {
  if( !req.isAuthenticated() ) {
    route.notFound404(req, rsp, next);
  } else {
    console.log('Request for ' + req.url + ' received from ' + req.headers['x-forwarded-for']);
    var path = url.parse(req.url).pathname;
    var splitPath = path.split('/')
    var query = url.parse(req.url).query;
    console.log('Request for ' + req.url + ' received from ' + req.headers['x-forwarded-for']);
    wpRequestHandlers.wpParse(req, splitPath, query, rsp);
  }
});

// Event Espresso REST API
webServer.get('/ee(/*)?',function(req, rsp, next) {
  if( !req.isAuthenticated() ) {
    route.notFound404(req, rsp, next);
  } else {
    console.log('Request for ' + req.url + ' received from ' + req.headers['x-forwarded-for']);
    var path = url.parse(req.url).pathname;
    var splitPath = path.split('/')
    var query = url.parse(req.url).query;
    console.log('Request for ' + req.url + ' received from ' + req.headers['x-forwarded-for']);
    eeRequestHandlers.eeParse(req, splitPath, query, rsp);
  }
 });

/********************************/
// 404 not found
webServer.use(route.notFound404);

webServer.listen(webServer.get('port'), function(err) {
  if(err) throw err;
  console.log('DCR API server listening on port ' + WS_PORT);
});

