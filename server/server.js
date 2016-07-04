var http = require('http');
var url = require('url');
var WP = require('wpapi');

var util = require('./util.js');
var wpRequestHandlers = require('./wpRequestHandlers.js');
var eeRequestHandlers = require('./eeRequestHandlers.js');

// Create the wpapi JSON objects on startup
var wpEp = new WP({ endpoint: 'https://desertcommunityrobotics.com/wp-json' });
var wpEpDiscovery = WP.discover( 'https://desertcommunityrobotics.com' );
// Export the wpapi hierarchy
exports.wpEp = wpEp;
exports.wpEpDiscovery = wpEpDiscovery;

var handle = {};
// Assign handlers for the root of the pathname
handle['']          = wpRequestHandlers.root;
handle['pages']     = wpRequestHandlers.pages;
handle['refresh']   = wpRequestHandlers.refresh;
handle['events']    = eeRequestHandlers.eeEvent;
handle['event']     = eeRequestHandlers.eeEvent;

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
