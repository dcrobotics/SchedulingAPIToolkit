var WP = require('wpapi');

var server = require('./server.js');
var util = require('./util.js');

const WP_JSON_EPNT = 'wp/v2'

function wpParse(req, splitPath, query, rsp){
  var chainRet = '';

  // See if we are just displaying the root
  if ( splitPath[2] == '' || splitPath[2] == undefined ) {
    wpRoot(req, splitPath, query, rsp);
    return;
  }

  // build the endpoint
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

  // Handle query parameters
  if ( query != null ) {
    var splitQuery = query.split('&');
    var arg;
    for (ii = 0; ii < splitQuery.length; ii++){
      args = splitQuery[ii].split('=');
      if ( args[0] == '' || args[0] == undefined || args[1] == '' || args[1] == undefined) {
        rspE(req, 'Invalid parameter parse: ' + splitQuery[ii] + 'from :' + query , rsp);
        return;
      } else { 
        chainRet = chainRet.param(args[0],args[1]); 
      }
    }
  }

  // Pull the data
  chainRet.then(function (data){ rspD(data, rsp); }).catch(function (err){ rspE(req, err, rsp); });
}
// *************************************************************************//
function wpRoot(req, splitPath, query, rsp){
  WP.site(server.DATA_SITE + server.WP_JSON_HEAD).root(WP_JSON_EPNT).then(function (data) {
    rspD(data, rsp); 
  }).catch(function (err){ rspE(req, err, rsp); });;
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

exports.wpParse = wpParse;
