var WP = require('wpapi');
var server = require('./server.js');
var util = require('./util.js');

function root(splitPath, query, response, request){
  response = util.setHeader(response,util.contType.TEXT);
  response.write('Welcome to DCR\'s node server' );
  response.end();
}
// Get a list of pages on the server
function pages(splitPath, query, response, request){
  server.wpEp.pages().get(function(err,data){
    if ( err ) {
      console.log(err);
    } else {
//      console.log(data);
      response = util.setHeader(response,util.contType.JSON);
      response.write(JSON.stringify(data));
      response.end();
    }
  });
}
function refresh(splitPath, query, response, request){
  server.wpEpDiscovery = WP.discover( 'https://desertcommunityrobotics.com' );
  response = util.setHeader(response,util.contType.TEXT);
  response.write('discovery data has been refreshed' );
  response.end();
}


exports.root = root;
exports.pages = pages;
exports.refresh = refresh;
