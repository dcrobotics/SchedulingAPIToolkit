var WP = require('wpapi');
var server = require('./server.js');
var util = require('./util.js');

// *************************************************************************//
function root(req, splitPath, query, rsp){
  util.sendResponse(rsp, util.contType.TEXT, 'Welcome to DCR\'s node server' );
}
// *************************************************************************//
function page(req, splitPath, query, rsp){
  // /page
  if (splitPath[2] == '' || splitPath[2] == undefined) {
    server.wpEp.pages().then(function (data){
      rspD(data, rsp); }).catch(function (err){ rspE(req, err, rsp);
    });
  // /page/****
  } else if (splitPath[3] == '' || splitPath[3] == undefined) {
    // /attendee/ID
    server.wpEp.pages().id(parseInt(splitPath[2])).then(function (data){
      rspD(data, rsp); }).catch(function (err){ rspE(req, err, rsp);
    });
  // /page/unmatched_path
  } else { rspE(req, "Unknown attendee path: '", rsp); }
}
// *************************************************************************//
function refresh(req, splitPath, query, rsp){
  server.wpEpDiscovery = WP.discover( server.DATA_SITE );
  util.sendResponse(rsp, util.contType.TEXT, 'Discovery data has been refreshed.' );
}
// *************************************************************************//
function rspD(data, rsp) {
  util.sendResponse(rsp, util.contType.JSON, JSON.stringify(data) );
}
// *************************************************************************//
function rspE(req, err, rsp) {
  console.log('Error: ' + err + ' from: ' + req.url);
  util.sendResponse(rsp, util.contType.TEXT, 'Error: ' + err + ' from: ' + req.url );
}
// *************************************************************************//

exports.root = root;
exports.page = page;
exports.refresh = refresh;
