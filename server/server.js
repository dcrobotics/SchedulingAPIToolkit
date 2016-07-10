//var http = require('http');
var express = require('express');
var url  = require('url');
var WP   = require('wpapi');

var util              = require('./util.js');
var auth              = require('./auth.js');
var wpRequestHandlers = require('./wpRequestHandlers.js');
var eeRequestHandlers = require('./eeRequestHandlers.js');

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
webServer.listen(WS_PORT, function() {console.log('DCR API server listening on port ' + WS_PORT);});

// Root route
webServer.get('/',function(req, rsp) {
  console.log('Request for ' + req.url + ' received from ' + req.headers['x-forwarded-for']);
  util.sendResponse(rsp, util.contType.TEXT, 'Welcome to DCR\'s node server' );
});
// /reresh route
webServer.get('/refresh',function(req, rsp) {
  wpEpDiscovery = WP.discover( DATA_SITE );
  util.sendResponse(rsp, util.contType.TEXT, 'Discovery data has been refreshed.' );
});

// Wordpress default REST API
webServer.get('/wp(/*)?',function(req, rsp) {
  console.log('Request for ' + req.url + ' received from ' + req.headers['x-forwarded-for']);
  var path = url.parse(req.url).pathname;
  var splitPath = path.split('/')
  var query = url.parse(req.url).query;
  console.log('Request for ' + req.url + ' received from ' + req.headers['x-forwarded-for']);
  wpRequestHandlers.wpParse(req, splitPath, query, rsp);
});

// Event Espresso REST API
webServer.get('/ee(/*)?',function(req, rsp) {
  console.log('Request for ' + req.url + ' received from ' + req.headers['x-forwarded-for']);
  var path = url.parse(req.url).pathname;
  var splitPath = path.split('/')
  var query = url.parse(req.url).query;
  console.log('Request for ' + req.url + ' received from ' + req.headers['x-forwarded-for']);
  eeRequestHandlers.eeParse(req, splitPath, query, rsp);
});


