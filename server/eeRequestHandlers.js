var WP = require('wpapi');

var server = require('./server.js');
var util   = require('./util.js');
var auth   = require('./auth.js');

const EE_JSON_EPNT = 'ee/v4.8.36'

function eeParse(req, splitPath, query, rsp){
  const authPaths = ['registrations', 'attendees', 'payments'];
  var chainRet = '';

  // Make sure discovery of is complete for custom endpoints
  server.wpEpDiscovery.then(function ( site ){
    if ( splitPath[2] == '' || splitPath[2] == undefined ) {
      eeRoot(req, splitPath, query, rsp);
      return;
    }
      // Make sure the first parameter maps to an endpoint
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
              rspE(req, "Invalid parseEE tertiary path: '", rsp); 
              return;
            }
          }
        } else { 
          rspE(req, "Invalid parseEE ID: '", rsp); 
          return;
        }
      }
    } else { 
      rspE(req, "Unknown parseEE primary path: '", rsp); 
      return;
    }

    // See if we need to Auth for any of the fields in the path
    if ( authPaths.indexOf(splitPath[2]) > -1 || authPaths.indexOf(splitPath[4]) > -1) {
      chainRet = chainRet.auth(auth.WP_JSON_USER,auth.WP_JSON_PASS)
    }
    // Pull the data
    chainRet.then(function (data){ rspD(data, rsp); }).catch(function (err){ rspE(req, err, rsp); });
  });
}
// *************************************************************************//
function eeRoot(req, splitPath, query, rsp){
  // /ee does not work yet
  WP.site(server.DATA_SITE + server.WP_JSON_HEAD).root(EE_JSON_EPNT).then(function (data) {
    rspD(data, rsp); 
  }).catch(function (err){ rspE(req, err, rsp); });
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

exports.eeParse = eeParse;
