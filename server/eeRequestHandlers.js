var WP = require('wpapi');

var server = require('./server.js');
var util = require('./util.js');

const EE_JSON_EPNT = 'ee/v4.8.36'

function eeEvent(splitPath, query, response, request){
  console.log(request.url);
  if (splitPath[2] == '' || splitPath[2] == undefined) {
    server.wpEpDiscovery.then(function ( site ){
      site.namespace( EE_JSON_EPNT ).events().then(function(data){
        response = util.setHeader(response,util.contType.JSON);
        response.write(JSON.stringify(data));
        response.end();
      });
    });
  } else if (splitPath[3] == '' || splitPath[3] == undefined) {
    server.wpEpDiscovery.then(function ( site ){
      site.namespace( EE_JSON_EPNT ).events().id(parseInt(splitPath[2])).then(function(data){
        response = util.setHeader(response,util.contType.JSON);
        response.write(JSON.stringify(data));
        response.end();
      });
    });
  } else {
    console.log('Warning: Unknown event path: ' + request.url );
    response = util.setHeader(response,util.contType.TEXT);
    response.write('Unknown event path: ' + request.url );
    response.end();
  }
}
function datetime(splitPath, query, response, request){
  console.log(request.url);
  server.wpEpDiscovery.then(function ( site ){
    site.namespace( EE_JSON_EPNT ).datetimes().id(2).then(function(data){
      response = util.setHeader(response,util.contType.JSON);
      response.write(JSON.stringify(data));
      response.end();
    });
  });
}

exports.eeEvent = eeEvent;
exports.datetime = datetime;
