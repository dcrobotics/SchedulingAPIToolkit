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

var util                  = require('./util.js');
var auth                  = require('./auth.js');

// Request handlers
var wpRequestHandlers     = require('./wpRequestHandlers.js');
var eeRequestHandlers     = require('./eeRequestHandlers.js');
var reportRequestHandlers = require('./reportRequestHandlers.js');

// Auth modules
var route = require('./route');
var model = require('./model');

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
webServer.set('views', path.join(__dirname, 'views'));
webServer.set('view engine', 'ejs');
webServer.use(cookieParser());
webServer.use(bodyParser.urlencoded({extended: true}));
webServer.use(bodyParser.json());

webServer.use(session({ secret: 'secret strategic xxzzz code', resave: true, saveUninitialized: true }));
webServer.use(passport.initialize());
webServer.use(passport.session());

webServer.get('^\/$', route.index);
// signin
webServer.get('^\/signin\/?$', route.signIn);
webServer.post('^\/signin\/?$', route.signInPost);

// signup
webServer.get('^\/signup\/?$', route.signUp);
webServer.post('^\/signup\/?$', route.signUpPost);
// logout
webServer.get('^\/signout\/?$', route.signOut);

/********************************/
// API Routes
webServer.get('^\/wp|^\/ee|^\/report|^\/refresh\/?$', function(req, rsp, next) {
  var timeDate = new Date();
  var checkAuth;
  var parse;
  
  var respond = function respond(data,err){
    if (err) {
      util.sendResponse(rsp, util.contType.TEXT, err );
    } else {
      util.sendResponse(rsp, util.contType.JSON, JSON.stringify(data));
    }
  };
  
  console.log('Request for ' + req.url + ' received from ' + req.headers['x-forwarded-for'] + ' on ' + timeDate.toString());

  var path = url.parse(req.url).pathname;
  var splitPath = path.split('/')
  var query = url.parse(req.url).query;
  switch (splitPath[1]) {
    case 'wp':
      checkAuth = wpRequestHandlers.wpCheckAuth; 
      parse     = wpRequestHandlers.wpParse;
      break;
    case 'ee':
      checkAuth = eeRequestHandlers.eeCheckAuth; 
      parse     = eeRequestHandlers.eeParse;
      break;
    case 'report':
      checkAuth = reportRequestHandlers.reportCheckAuth; 
      parse     = reportRequestHandlers.reportParse;
      break;
    case 'refresh':
      wpEpDiscovery = WP.discover( DATA_SITE );
      util.sendResponse(rsp, util.contType.TEXT, 'Discovery data has been refreshed.' );
      return;
      break;
    default:
      route.notFound404(req, rsp, next);
      return;
  }
  if (checkAuth(splitPath) & !req.isAuthenticated()){
    route.notFound404(req, rsp, next);
    return;
  }
  parse(req, splitPath, query, respond);

});



/********************************/
// 404 not found
webServer.use(route.notFound404);

webServer.listen(webServer.get('port'), function(err) {
  if(err) throw err;
  console.log('DCR API server listening on port ' + WS_PORT);
});
// *************************************************************************//
