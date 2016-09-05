var WP = require('wpapi');

var server = require('./server.js');

const WP_JSON_EPNT = 'wp/v2'

function wpParse(req, splitPath, query, passFunc){
  var chainRet = '';

  // See if we are just displaying the root
  if ( splitPath[2] == '' || splitPath[2] == undefined ) {
    wpRoot(req, passFunc);
    return;
  }

  // build the endpoint
  if ( typeof server.wpEp[splitPath[2]] === "function" ) {
    chainRet = server.wpEp[splitPath[2]]();
    if ( splitPath[3] != '' && splitPath[3] != undefined ) {
      if ( !isNaN(splitPath[3]) ) {
        chainRet = chainRet.id(parseInt(splitPath[3]));
      } else { 
        passFunc([],'wpParse Error: Invalid ID: ' + splitPath[3] + ' from: ' + req.url);
        return;
      }
    }
  } else { 
    passFunc([],'wpParse Error: Unknown primary path: ' + splitPath[2] + ' from: ' + req.url);
    return;
  }

  // Handle query parameters
  if ( query != null ) {
    var splitQuery = query.split('&');
    var arg;
    for (ii = 0; ii < splitQuery.length; ii++){
      args = splitQuery[ii].split('=');
      if ( args[0] == '' || args[0] == undefined || args[1] == '' || args[1] == undefined) {
        passFunc([],'wpParse Error: Invalid parameter: ' + splitQuery[ii] + ' from: ' + req.url);
        return;
      } else { 
        chainRet = chainRet.param(args[0],args[1]); 
      }
    }
  }

  // Pull the data
  chainRet.then(function (data){ 
    passFunc(data,'');
    return;
  }).catch(function (err){ 
    passFunc([],'eeParse Error: Data fetch error: ' + err + ' from: ' + req.url);
    return;
  });
  return;
}
// *************************************************************************//
function wpRoot(req, passFunc){
  WP.site(server.DATA_SITE + server.WP_JSON_HEAD).root(WP_JSON_EPNT).then(function (data) {
    passFunc(data,'');
  }).catch(function (err){ 
    passFunc([],'wpRoot Error: Data fetch error: ' + err + ' from: ' + req.url);
  });
  return;
}

exports.wpParse = wpParse;
