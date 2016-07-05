var WP = require('wpapi');

var server = require('./server.js');
var util   = require('./util.js');
var auth   = require('./auth.js');

const EE_JSON_EPNT = 'ee/v4.8.36'

var retData = '';
var retErr = '';

function eeEvent(splitPath, query, response, request){
  console.log(request.url);

  // /event
  if (splitPath[2] == '' || splitPath[2] == undefined) {
    server.wpEpDiscovery.then(function ( site ){
      site.namespace( EE_JSON_EPNT ).events().then(function(data){
        util.sendResponse(response, util.contType.JSON, JSON.stringify(data) )
      }).catch(function (err){
        util.sendResponse(response, util.contType.TEXT, 'Error retrieving events: ' + err )
      });
    });

  // /event/****
  } else if (splitPath[3] == '' || splitPath[3] == undefined) {
    // /event/id
    server.wpEpDiscovery.then(function ( site ){
      site.namespace( EE_JSON_EPNT ).events().id(parseInt(splitPath[2])).then(function(data){
        util.sendResponse(response, util.contType.JSON, JSON.stringify(data) )
      }).catch(function (err){
        console.log('Error retrieving event: ' + err);
        util.sendResponse(response, util.contType.TEXT, 'Error retrieving event: ' + err )
      });
    });

  // /event/id/****
  } else if (splitPath[4] == '' || splitPath[4] == undefined) {
    // /event/id/tickets
    if (splitPath[3] == 'tickets'){
      server.wpEpDiscovery.then(function ( site ){
        // site.namespace( EE_JSON_EPNT ).tickets().param('where[Datetime.Event.EVT_ID]',splitPath[2]).param('include','TKT_name').then(function(data){
        site.namespace( EE_JSON_EPNT ).tickets().param('where[Datetime.Event.EVT_ID]',splitPath[2]).then(function(data){
          util.sendResponse(response, util.contType.JSON, JSON.stringify(data) )
        }).catch(function (err){
          console.log('Error retrieving event: ' + err);
          util.sendResponse(response, util.contType.TEXT, 'Error retrieving event: ' + err )
        });
      });

    // /event/id/datetimes
    } else if (splitPath[3] == 'datetimes'){ 
      server.wpEpDiscovery.then(function ( site ){
        site.namespace( EE_JSON_EPNT ).events().id(parseInt(splitPath[2])).datetimes().then(function(data){
          util.sendResponse(response, util.contType.JSON, JSON.stringify(data) )
        }).catch(function (err){
          console.log('Error retrieving event: ' + err);
          util.sendResponse(response, util.contType.TEXT, 'Error retrieving event: ' + err )
        });
      });
      // /event/id/registrations
      } else if (splitPath[3] == 'registrations'){ 
      server.wpEpDiscovery.then(function ( site ){
        site.namespace( EE_JSON_EPNT ).events().id(parseInt(splitPath[2])).registrations().auth(auth.WP_JSON_USER,auth.WP_JSON_PASS).then(function(data){
          util.sendResponse(response, util.contType.JSON, JSON.stringify(data) )
        }).catch(function (err){
          util.sendResponse(response, util.contType.TEXT, 'Error retrieving registration: ' + err )
        });
      });
      // /event/id/attendees
      } else if (splitPath[3] == 'attendees'){ 
      server.wpEpDiscovery.then(function ( site ){
        site.namespace( EE_JSON_EPNT ).events().id(parseInt(splitPath[2])).attendees().auth(auth.WP_JSON_USER,auth.WP_JSON_PASS).then(function(data){
          util.sendResponse(response, util.contType.JSON, JSON.stringify(data) )
        }).catch(function (err){
          util.sendResponse(response, util.contType.TEXT, 'Error retrieving registration: ' + err )
        });
      });
    // /event/id/unmatched_path
    } else {
      console.log('Warning: Unknown event path: ' + request.url );
      util.sendResponse(response, util.contType.TEXT, 'Unknown event path: ' + request.url )
    }

  // /event/unmatched_path
  } else {
    console.log('Warning: Unknown event path: ' + request.url );
    util.sendResponse(response, util.contType.TEXT, 'Unknown event path: ' + request.url )
  }
}
// *************************************************************************//
function eeDateTime(splitPath, query, response, request){
  console.log(request.url);

  // /datetime
  if (splitPath[2] == '' || splitPath[2] == undefined) {
    server.wpEpDiscovery.then(function ( site ){
      site.namespace( EE_JSON_EPNT ).datetimes().then(function(data){
        util.sendResponse(response, util.contType.JSON, JSON.stringify(data) )
      }).catch(function (err){
        util.sendResponse(response, util.contType.TEXT, 'Error retrieving datetime: ' + err )
      });
    });

  // /datetime/****
  } else if (splitPath[3] == '' || splitPath[3] == undefined) {
    // /datetime/ID
    server.wpEpDiscovery.then(function ( site ){
      site.namespace( EE_JSON_EPNT ).datetimes().id(parseInt(splitPath[2])).then(function(data){
        util.sendResponse(response, util.contType.JSON, JSON.stringify(data) )
      }).catch(function (err){
        console.log('Error retrieving datetime: ' + err);
        util.sendResponse(response, util.contType.TEXT, 'Error retrieving datetime: ' + err )
      });
    });

  // /datetime/unmatched_path
  } else {
    console.log('Warning: Unknown datetime path: ' + request.url );
    util.sendResponse(response, util.contType.TEXT, 'Unknown datetime path: ' + request.url )
  }
}
// *************************************************************************//
function eeRegistration(splitPath, query, response, request){
  retErr = '';

  // /registration
  if (splitPath[2] == '' || splitPath[2] == undefined) {
    server.wpEpDiscovery.then(function ( site ){
      site.namespace( EE_JSON_EPNT ).registrations().auth(auth.WP_JSON_USER,auth.WP_JSON_PASS).then(function(data){ 
        util.sendResponse(response, util.contType.JSON, JSON.stringify(data) )
      }).catch(function (err){ 
        console.log('Error:  ' + err + ' from: ' + request.url);
        util.sendResponse(response, util.contType.TEXT, 'Error:  ' + err + ' from: ' + request.url )
      });
    });

  // /registration/****
  } else if (splitPath[3] == '' || splitPath[3] == undefined) {
    // /registration/ID
    server.wpEpDiscovery.then(function ( site ){
      site.namespace( EE_JSON_EPNT ).registrations().id(parseInt(splitPath[2])).auth(auth.WP_JSON_USER,auth.WP_JSON_PASS).then(function(data){
        util.sendResponse(response, util.contType.JSON, JSON.stringify(data) )
      }).catch(function (err){ 
        console.log('Error:  ' + err + ' from: ' + request.url);
        util.sendResponse(response, util.contType.TEXT, 'Error:  ' + err + ' from: ' + request.url )
      });
    });

  // /registration/id/****
  } else if (splitPath[4] == '' || splitPath[4] == undefined) {
    // /event/id/answers
    if (splitPath[3] == 'answers'){
      server.wpEpDiscovery.then(function ( site ){
        site.namespace( EE_JSON_EPNT ).registrations().id(parseInt(splitPath[2])).answers().auth(auth.WP_JSON_USER,auth.WP_JSON_PASS).then(function(data){
        util.sendResponse(response, util.contType.JSON, JSON.stringify(data) )
      }).catch(function (err){ 
        console.log('Error:  ' + err + ' from: ' + request.url);
        util.sendResponse(response, util.contType.TEXT, 'Error:  ' + err + ' from: ' + request.url )
      });
    });

    // /event/id/unmatched_path
    } else { retErr = 'Unknown registration path' }
  // /registration/unmatched_path
  } else { retErr = 'Unknown registration path' }

}
// *************************************************************************//
function eeAttendee(splitPath, query, response, request){
  console.log(request.url);
  var root_name = 'attendees';
  // /attendee
  if (splitPath[2] == '' || splitPath[2] == undefined) {
    server.wpEpDiscovery.then(function ( site ){
      site.namespace( EE_JSON_EPNT ).root_name().auth(auth.WP_JSON_USER,auth.WP_JSON_PASS).then(function(data){
        util.sendResponse(response, util.contType.JSON, JSON.stringify(data) )
      }).catch(function (err){
        util.sendResponse(response, util.contType.TEXT, 'Error retrieving attendee: ' + err )
      });
    });

  // /attendee/****
  } else if (splitPath[3] == '' || splitPath[3] == undefined) {
    // /attendee/ID
    server.wpEpDiscovery.then(function ( site ){
      site.namespace( EE_JSON_EPNT ).attendees().auth(auth.WP_JSON_USER,auth.WP_JSON_PASS).id(parseInt(splitPath[2])).then(function(data){
        util.sendResponse(response, util.contType.JSON, JSON.stringify(data) )
      }).catch(function (err){
        console.log('Error retrieving attendee: ' + err);
        util.sendResponse(response, util.contType.TEXT, 'Error retrieving attendee: ' + err )
      });
    });

  // /attendee/unmatched_path
  } else {
    console.log('Warning: Unknown attendee path: ' + request.url );
    util.sendResponse(response, util.contType.TEXT, 'Unknown attendee path: ' + request.url )
  }
}
// *************************************************************************//

exports.eeEvent         = eeEvent;
exports.eeDateTime      = eeDateTime;
exports.eeRegistration  = eeRegistration;
exports.eeAttendee      = eeAttendee;
