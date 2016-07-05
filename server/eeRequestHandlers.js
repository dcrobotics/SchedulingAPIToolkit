var WP = require('wpapi');

var server = require('./server.js');
var util   = require('./util.js');
var auth   = require('./auth.js');

const EE_JSON_EPNT = 'ee/v4.8.36'

var retData = '';
var retErr = '';

function eeEvent(req, splitPath, query, rsp){
  // /event
  if (splitPath[2] == '' || splitPath[2] == undefined) {
    server.wpEpDiscovery.then(function ( site ){
      site.namespace( EE_JSON_EPNT ).events().then(function (data){
        rspD(data, rsp); }).catch(function (err){ rspE(req, err, rsp);
      });
    });
  // /event/****
  } else if (splitPath[3] == '' || splitPath[3] == undefined) {
    // /event/id
    server.wpEpDiscovery.then(function ( site ){
      site.namespace( EE_JSON_EPNT ).events().id(parseInt(splitPath[2])).then(function (data){
        rspD(data, rsp); }).catch(function (err){ rspE(req, err, rsp);
      });
    });
  // /event/id/****
  } else if (splitPath[4] == '' || splitPath[4] == undefined) {
    // /event/id/tickets
    if (splitPath[3] == 'tickets'){
      server.wpEpDiscovery.then(function ( site ){
        site.namespace( EE_JSON_EPNT ).tickets().param('where[Datetime.Event.EVT_ID]',splitPath[2]).then(function (data){
          rspD(data, rsp); }).catch(function (err){ rspE(req, err, rsp);
        });
      });
    // /event/id/datetimes
    } else if (splitPath[3] == 'datetimes'){
      server.wpEpDiscovery.then(function ( site ){
        site.namespace( EE_JSON_EPNT ).events().id(parseInt(splitPath[2])).datetimes().then(function (data){
          rspD(data, rsp); }).catch(function (err){ rspE(req, err, rsp);
        });
      });
      // /event/id/registrations
      } else if (splitPath[3] == 'registrations'){
      server.wpEpDiscovery.then(function ( site ){
        site.namespace( EE_JSON_EPNT ).events().id(parseInt(splitPath[2])).registrations().auth(auth.WP_JSON_USER,auth.WP_JSON_PASS).then(function (data){
          rspD(data, rsp); }).catch(function (err){ rspE(req, err, rsp);
        });
      });
      // /event/id/attendees
      } else if (splitPath[3] == 'attendees'){
      server.wpEpDiscovery.then(function ( site ){
        site.namespace( EE_JSON_EPNT ).events().id(parseInt(splitPath[2])).attendees().auth(auth.WP_JSON_USER,auth.WP_JSON_PASS).then(function (data){
          rspD(data, rsp); }).catch(function (err){ rspE(req, err, rsp);
        });
      });
    // /event/id/unmatched_path
    } else { rspE(req, "Unknown event path: '", rsp); }
  // /event/unmatched_path
  } else { rspE(req, "Unknown event path: '", rsp); }
}
// *************************************************************************//
function eeDateTime(req, splitPath, query, rsp){
  // /datetime
  if (splitPath[2] == '' || splitPath[2] == undefined) {
    server.wpEpDiscovery.then(function ( site ){
      site.namespace( EE_JSON_EPNT ).datetimes().then(function (data){
        rspD(data, rsp); }).catch(function (err){ rspE(req, err, rsp);
      });
    });
  // /datetime/****
  } else if (splitPath[3] == '' || splitPath[3] == undefined) {
    // /datetime/ID
    server.wpEpDiscovery.then(function ( site ){
      site.namespace( EE_JSON_EPNT ).datetimes().id(parseInt(splitPath[2])).then(function (data){
        rspD(data, rsp); }).catch(function (err){ rspE(req, err, rsp);
      });
    });
  // /datetime/unmatched_path
  } else { rspE(req, "Unknown datetime path: '", rsp); }
}
// *************************************************************************//
function eeRegistration(req, splitPath, query, rsp){
  // /registration
  if (splitPath[2] == '' || splitPath[2] == undefined) {
    server.wpEpDiscovery.then(function ( site ){
      site.namespace( EE_JSON_EPNT ).registrations().auth(auth.WP_JSON_USER,auth.WP_JSON_PASS).then(function (data){
        rspD(data, rsp); }).catch(function (err){ rspE(req, err, rsp);
      });
    });
  // /registration/****
  } else if (splitPath[3] == '' || splitPath[3] == undefined) {
    // /registration/ID
    server.wpEpDiscovery.then(function ( site ){
      site.namespace( EE_JSON_EPNT ).registrations().id(parseInt(splitPath[2])).auth(auth.WP_JSON_USER,auth.WP_JSON_PASS).then(function (data){
        rspD(data, rsp); }).catch(function (err){ rspE(req, err, rsp);
      });
    });
  // /registration/id/****
  } else if (splitPath[4] == '' || splitPath[4] == undefined) {
    // /event/id/answers
    if (splitPath[3] == 'answers'){
      server.wpEpDiscovery.then(function ( site ){
        site.namespace( EE_JSON_EPNT ).registrations().id(parseInt(splitPath[2])).answers().auth(auth.WP_JSON_USER,auth.WP_JSON_PASS).then(function (data){
          rspD(data, rsp); }).catch(function (err){ rspE(req, err, rsp);
        });
      });
    // /event/id/unmatched_path
    } else { rspE(req, "Unknown registration path: '", rsp); }
  // /registration/unmatched_path
  } else { rspE(req, "Unknown registration path: '", rsp); }
}
// *************************************************************************//
function eeAttendee(req, splitPath, query, rsp){
  // /attendee
  if (splitPath[2] == '' || splitPath[2] == undefined) {
    server.wpEpDiscovery.then(function ( site ){
      site.namespace( EE_JSON_EPNT ).attendees().auth(auth.WP_JSON_USER,auth.WP_JSON_PASS).then(function (data){
        rspD(data, rsp); }).catch(function (err){ rspE(req, err, rsp);
      });
    });
  // /attendee/****
  } else if (splitPath[3] == '' || splitPath[3] == undefined) {
    // /attendee/ID
    server.wpEpDiscovery.then(function ( site ){
      site.namespace( EE_JSON_EPNT ).attendees().auth(auth.WP_JSON_USER,auth.WP_JSON_PASS).id(parseInt(splitPath[2])).auth(auth.WP_JSON_USER,auth.WP_JSON_PASS).then(function (data){
        rspD(data, rsp); }).catch(function (err){ rspE(req, err, rsp);
      });
    });
  // /attendee/unmatched_path
  } else { rspE(req, "Unknown attendee path: '", rsp); }
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

exports.eeEvent         = eeEvent;
exports.eeDateTime      = eeDateTime;
exports.eeRegistration  = eeRegistration;
exports.eeAttendee      = eeAttendee;
