var WP = require('wpapi');
var https = require("https");

var server = require('./server.js');
var util = require('./util.js');

const EE_JSON_EPNT = 'ee/v4.8.36'

function eeEvent(splitPath, query, response, request){
  console.log(request.url);
  if (splitPath[2] == '' || splitPath[2] == undefined) {
    server.wpEpDiscovery.then(function ( site ){
      site.namespace( EE_JSON_EPNT ).events().then(function(data){
        util.sendResponse(response, util.contType.JSON, JSON.stringify(data) )
      }).catch(function (err){
        util.sendResponse(response, util.contType.TEXT, 'Error retrieiveing events: ' + err )
      });
    });
  } else if (splitPath[3] == '' || splitPath[3] == undefined) {
    server.wpEpDiscovery.then(function ( site ){
      site.namespace( EE_JSON_EPNT ).events().id(parseInt(splitPath[2])).then(function(data){
        util.sendResponse(response, util.contType.JSON, JSON.stringify(data) )
      }).catch(function (err){
        console.log('Error retrieiveing event: ' + err);
        util.sendResponse(response, util.contType.TEXT, 'Error retrieiveing event: ' + err )
      });
    });
  } else if (splitPath[4] == '' || splitPath[4] == undefined) {
    if (splitPath[3] == 'tickets'){
      var reqURL = server.DATA_SITE + server.WP_JSON_HEAD + EE_JSON_EPNT +'/tickets?include=TKT_name&where[Datetime.Event.EVT_ID]='+splitPath[2];
      https.get(reqURL, function (getresp) {
        var respBody = ""; //the response we get
        getresp.on("data", function (chunk) {
          respBody += chunk; //we're going to wait until we have everything to send anything in case we want to deserialize the JSON or modify it in some way
        });
        getresp.on("end", function () {
          var data = JSON.parse(respBody); //parse the events
          util.sendResponse(response, util.contType.JSON, JSON.stringify(data) )
        });
      }).on('error', function (err) {
        console.log('Error retrieiveing event tickets: ' + err);
        util.sendResponse(response, util.contType.TEXT, 'Error retrieiveing event tickets: ' + err )
      });
    } else if (splitPath[3] == 'datetimes'){ 
      server.wpEpDiscovery.then(function ( site ){
        site.namespace( EE_JSON_EPNT ).events().id(parseInt(splitPath[2])).datetimes().then(function(data){
          util.sendResponse(response, util.contType.JSON, JSON.stringify(data) )
        }).catch(function (err){
          console.log('Error retrieiveing event: ' + err);
          util.sendResponse(response, util.contType.TEXT, 'Error retrieiveing event: ' + err )
        });
      });
      
    } else {
      console.log('Warning: Unknown event path: ' + request.url );
      util.sendResponse(response, util.contType.TEXT, 'Unknown event path: ' + request.url )
    }
  } else {
    console.log('Warning: Unknown event path: ' + request.url );
    util.sendResponse(response, util.contType.TEXT, 'Unknown event path: ' + request.url )
  }
}
function eeDateTime(splitPath, query, response, request){
  console.log(request.url);
  server.wpEpDiscovery.then(function ( site ){
    site.namespace( EE_JSON_EPNT ).datetimes().id(2).then(function(data){
      util.sendResponse(response, util.contType.JSON, JSON.stringify(data) )
    });
  });
}

exports.eeEvent = eeEvent;
exports.eeDateTime = eeDateTime;
