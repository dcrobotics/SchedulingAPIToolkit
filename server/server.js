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

var handle = {};
// Assign handlers for the root of the pathname
handle['']        = wpRequestHandlers.root;
handle['refresh'] = wpRequestHandlers.refresh;
handle['wp']      = wpRequestHandlers.wpParse;
handle['ee']      = eeRequestHandlers.eeParse;

function route(request, splitPath, query, response) {
  //console.log('Routing a request for /' + splitPath[1]);
  // Use the root of the pathname to determine a handler
  if (typeof handle[splitPath[1]] === 'function'){
    handle[splitPath[1]](request, splitPath, query, response);
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
    console.log('Request for ' + request.url + ' received from ' + request.headers['x-forwarded-for']);
    route(request, splitPath, query, response);
  }
  http.createServer(onRequest).listen(8080);
  console.log('Server listening on port 8080');
}

startServer();
