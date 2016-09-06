var WP = require('wpapi');

var server = require('./server.js');
var auth   = require('./auth.js');

const EE_JSON_EPNT = 'ee/v4.8.36'

function eeParse(req, splitPath, query, passFunc){
  var chainRet = '';

  // Make sure discovery of is complete for custom endpoints
  server.wpEpDiscovery.then(function ( site ){

    // See if we are just displaying the root
    if ( splitPath[2] == '' || splitPath[2] == undefined ) {
      eeRoot(req, passFunc);
      return;
    }

    // build the endpoint
    if ( typeof site.namespace( EE_JSON_EPNT )[splitPath[2]] === "function" ) {
      chainRet = site.namespace( EE_JSON_EPNT )[splitPath[2]]();
      // See if the second parameter exists and make sure it is a proper number that could be an ID
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
          passFunc([],'eeParse Error: Invalid ID: ' + splitPath[3] + ' from: ' + req.url);
          return;
        }
      }
    } else { 
      passFunc([],'eeParse Error: Unknown primary path: ' + splitPath[2] + ' from: ' + req.url);
      return;
    }

    // See if we need to Auth for any of the fields in the path
    if ( eeCheckAuth(splitPath) ) {
      chainRet = chainRet.auth(auth.WP_JSON_USER,auth.WP_JSON_PASS)
    }

    // Handle query parameters
    if ( query != null ) {
      var splitQuery = query.split('&');
      for (ii = 0; ii < splitQuery.length; ii++){
        args = splitQuery[ii].split('=');
        if ( args[0] == '' || args[0] == undefined || args[1] == '' || args[1] == undefined) {
          passFunc([],'eeParse Error: Invalid parameter: ' + splitQuery[ii] + ' from: ' + req.url);
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
  });
  return;
}
// *************************************************************************//
function eeRoot(req, passFunc){
  WP.site(server.DATA_SITE + server.WP_JSON_HEAD).root(EE_JSON_EPNT).then(function (data) {
    passFunc(data,'');
  }).catch(function (err){
    passFunc([],'eeRoot Error: Data fetch error: ' + err + ' from: ' + req.url);
  });
  return;
}

function eeCheckAuth(splitPath){
  const authPaths = ['registrations', 'attendees', 'payments'];

  if ( authPaths.indexOf(splitPath[2]) > -1 || authPaths.indexOf(splitPath[4]) > -1) {
    return true;
  }
  return false;
  
}

exports.eeParse     = eeParse;
exports.eeCheckAuth = eeCheckAuth;
