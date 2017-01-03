var WP = require('wpapi');

var route = require('./route.js');
var auth  = require('./auth.js');

const WP_JSON_EPNT = 'wp/v2'

var wpRoot = function wpRoot(req, passFunc){
  WP.site(route.DATA_SITE + route.WP_JSON_HEAD).root(WP_JSON_EPNT).then(function (data) {
    passFunc(data,'');
  }).catch(function (err){ 
    passFunc([],'wpRoot Error: Data fetch error: ' + err + ' from: ' + req.url);
  });
  return;
}

var wpParse = function wpParse(req, splitPath, query, passFunc, rsp){
  var chainRet = '';

  // See if we are just displaying the root
  if ( splitPath[2] == '' || splitPath[2] == undefined ) {
    wpRoot(req, passFunc);
    return;
  }

  // build the endpoint
  if ( typeof route.wpEp[splitPath[2]] === "function" ) {
    chainRet = route.wpEp[splitPath[2]]();
    if ( splitPath[3] != '' && splitPath[3] != undefined ) {
      if ( !isNaN(splitPath[3]) ) {
        chainRet = chainRet.id(parseInt(splitPath[3]));
        // See if the third parameter exists and make see if it maps to an endpoint
        if ( splitPath[4] != '' && splitPath[4] != undefined ) {
          if ( typeof chainRet[splitPath[4]] === "function" ) {
            chainRet = chainRet[splitPath[4]]();
          } else {
            passFunc([],'eeParse Error: Unknown tertiary path: ' + splitPath[4] + ' from: ' + req.url);
            return;
          }
        }
      } else { 
        passFunc([],'wpParse Error: Invalid ID: ' + splitPath[3] + ' from: ' + req.url);
        return;
      }
    }
  } else { 
    passFunc([],'wpParse Error: Unknown primary path: ' + splitPath[2] + ' from: ' + req.url);
    return;
  }

  // Automatically send authentication of the user is authenticated
  if ( req.isAuthenticated() ) {
    chainRet = chainRet.auth(auth.WP_JSON_USER,auth.WP_JSON_PASS)
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

var wpCheckAuth = function wpCheckAuth(splitPath){
  const authPaths = ['users','revisions' ];

  if ( authPaths.indexOf(splitPath[2]) > -1 || authPaths.indexOf(splitPath[4]) > -1) {
    return true;
  }
  return false;
  
}

exports.wpParse = wpParse;
exports.wpCheckAuth = wpCheckAuth;
