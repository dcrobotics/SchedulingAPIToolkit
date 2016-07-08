var WP = require('wpapi');
var server = require('./server.js');
var util = require('./util.js');

// *************************************************************************//
function root(req, splitPath, query, rsp){
  util.sendResponse(rsp, util.contType.TEXT, 'Welcome to DCR\'s node server' );
}
// *************************************************************************//
function wpParse(req, splitPath, query, rsp){
  var chainRet = '';
  console.log(splitPath);

  if ( typeof server.wpEp[splitPath[2]] === "function" ) {
    chainRet = server.wpEp[splitPath[2]]();
    if ( splitPath[3] != '' && splitPath[3] != undefined ) {
      if ( !isNaN(splitPath[3]) ) {
        chainRet = chainRet.id(parseInt(splitPath[3]));
      } else { 
        rspE(req, "Invalid wpParse ID: '", rsp); 
        return;
      }
    }
  } else { 
    rspE(req, "Unknown parseEE primary path: '", rsp); 
    return;
  }

  chainRet.then(function (data){ rspD(data, rsp); }).catch(function (err){ rspE(req, err, rsp); });
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
exports.wpParse = wpParse;
exports.refresh = refresh;
