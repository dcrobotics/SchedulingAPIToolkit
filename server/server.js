var http = require('http');
var url  = require('url');
var WP   = require('wpapi');

var util              = require('./util.js');
var auth              = require('./auth.js');
var wpRequestHandlers = require('./wpRequestHandlers.js');
var eeRequestHandlers = require('./eeRequestHandlers.js');

// Create the wpapi JSON objects on startup
const DATA_SITE = 'https://desertcommunityrobotics.com/'
const WP_JSON_HEAD = 'wp-json/'
const WP_JSON_EPNT = 'wp/v2'
var wpEp = new WP({ endpoint: DATA_SITE + WP_JSON_HEAD,
                    username: auth.WP_JSON_USER,
                    password: auth.WP_JSON_PASS
                 });
var wpEpDiscovery = WP.discover( DATA_SITE );
// Export the wpapi hierarchy
exports.DATA_SITE    = DATA_SITE;
exports.WP_JSON_HEAD = WP_JSON_HEAD;
exports.WP_JSON_EPNT = WP_JSON_EPNT;
exports.wpEp = wpEp;
exports.wpEpDiscovery = wpEpDiscovery;

var handle = {};
// Assign handlers for the root of the pathname
handle['']              = wpRequestHandlers.root;
handle['pages']         = wpRequestHandlers.pages;
handle['refresh']       = wpRequestHandlers.refresh;
handle['events']        = eeRequestHandlers.eeEvent;
handle['event']         = eeRequestHandlers.eeEvent;
handle['datetimes']     = eeRequestHandlers.eeDateTime;
handle['datetime']      = eeRequestHandlers.eeDateTime;
handle['registrations'] = eeRequestHandlers.eeRegistration;
handle['registration']  = eeRequestHandlers.eeRegistration;
handle['attendees']     = eeRequestHandlers.eeAttendee;
handle['attendee']      = eeRequestHandlers.eeAttendee;


function route(splitPath, query, response, request) {
  console.log('Routing a request for /' + splitPath[1]);
  // Use the root of the pathname to determine a handler
  if (typeof handle[splitPath[1]] === 'function'){
    handle[splitPath[1]](splitPath, query, response, request);
  } else {
    console.log('No request handler found for ' + splitPath[1] + ' of ' + request.url);
    response.writeHead(404, {'Content-Type':'text/plain'});
    response.write('404 Not Found');
    response.end();
  }
}

function startServer() {
  function onRequest(request, response) {
    var path = url.parse(request.url).pathname;
    var splitPath = path.split('/')
    var query = url.parse(request.url).query;
    console.log('Request for ' + path + ' received');
    route(splitPath, query, response, request);
  }
  http.createServer(onRequest).listen(8080);
  console.log('Server listening on port 8080');
}

startServer();
