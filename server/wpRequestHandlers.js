var WP = require('wpapi');
var server = require('./server.js');
var util = require('./util.js');

function root(splitPath, query, response, request){
  util.sendResponse(response, util.contType.TEXT, 'Welcome to DCR\'s node server' )
}
// Get a list of pages on the server
function pages(splitPath, query, response, request){
  server.wpEp.pages().get(function(err,data){
    if ( err ) {
      console.log(err);
    } else {
      //console.log(data);
      util.sendResponse(response, util.contType.JSON, JSON.stringify(data) )
    }
  });
}
function refresh(splitPath, query, response, request){
  server.wpEpDiscovery = WP.discover( server.DATA_SITE );
  util.sendResponse(response, util.contType.TEXT, 'Discovery data has been refreshed.' )
}


exports.root = root;
exports.pages = pages;
exports.refresh = refresh;
