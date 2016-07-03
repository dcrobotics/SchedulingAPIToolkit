var WP = require('wpapi');
var server = require('./server.js');
const EE_JSON_EPNT = 'ee/v4.8.36'

function events(splitPath, query, response, request){
  console.log(request.url);
  server.wpEpDiscovery.then(function ( site ){
    site.namespace( EE_JSON_EPNT ).events().then(function(data){
      response = easyHeader(response);
      response.write(JSON.stringify(data));
      response.end();
    });
  });
}
function event(splitPath, query, response, request){
  console.log(request.url);
  server.wpEpDiscovery.then(function ( site ){
    site.namespace( EE_JSON_EPNT ).events().id(5660).datetimes().then(function(data){
      response = easyHeader(response);
      response.write(JSON.stringify(data));
      response.end();
    });
  });
}
function datetime(splitPath, query, response, request){
  console.log(request.url);
  server.wpEpDiscovery.then(function ( site ){
    site.namespace( EE_JSON_EPNT ).datetimes().id(2).then(function(data){
      response = easyHeader(response);
      response.write(JSON.stringify(data));
      response.end();
    });
  });
}

function easyHeader(response){
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  response.writeHead(200, {
    'Content-Type': 'text/JSON'
  });
  return response;
}

exports.events = events;
exports.event = event;
exports.datetime = datetime;
