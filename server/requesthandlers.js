//OUT OF DATE, SEE AUTHENTICATION.JS FOR PROPER REQUEST IMPLEMENTATION
var querystring = require("querystring");
var https = require("https");
var nreq = require("./noderequester");
var WP = require("wpapi");
var wp = new WP({ endpoint: 'https://desertcommunityrobotics.com/wp-json' });
var wp_scope="*";
var apiPromise = WP.discover( 'https://desertcommunityrobotics.com' );
const EE_JSON_EPNT = 'ee/v4.8.36'
/* routing functions */


//response = the response we send
//request = the request that we recieved
//search = filter parameters I think

//TODO: clean this stuff up
//DELETED testAuth(): moved functionality to authentication/leg1


// trying to use the wpapi code
function pages(search, response, request){
  wp.pages().get(function(err,data){
    if ( err ) {
      console.log(err);
    } else {
//      console.log(data);
      response = easyHeader(response);
      response.write(JSON.stringify(data));
      response.end();
    }
  });
}
function events(search, response, request){
  console.log(request.url);
  apiPromise.then(function ( site ){
    site.namespace( EE_JSON_EPNT ).events().then(function(data){
        response = easyHeader(response);
        response.write(JSON.stringify(data));
        response.end();
    });
  });
}
function event(search, response, request){
  console.log(request.url);
  apiPromise.then(function ( site ){
    site.namespace( EE_JSON_EPNT ).events().id(5660).datetimes().then(function(data){
        response = easyHeader(response);
        response.write(JSON.stringify(data));
        response.end();
    });
  });
}
function datetime(search, response, request){
  console.log(request.url);
  apiPromise.then(function ( site ){
    site.namespace( EE_JSON_EPNT ).datetimes().id(2).then(function(data){
        response = easyHeader(response);
        response.write(JSON.stringify(data));
        response.end();
    });
  });
}
//TODO: Clean up TK
//request = the response we send
function oldevents(search, response, request) {
    var requrl = "https://desertcommunityrobotics.com/wp-json/ee/v4.8.29/events";
    https.get(requrl, function (res) {
        var resBody = ""; //the response we get
        res.on("data", function (chunk) {
            resBody += chunk; //we're going to wait until we have everything to send anything in case we want to deserialize the JSON or modify it in some way
        });
            res.on("end", function () {
//            console.log(resBody);
            var parsedObj = JSON.parse(resBody); //parse the events
            response = easyHeader(response);

            for(var i = 0; i < parsedObj.length; i++){ //iterate through events
                // response.write("Event ID: " + parsedObj[i]["EVT_ID"] +"\n");
                //TODO: attach datetimes
                //TODO: use get /"extraction" functions that build these links, are passed events or whatever
                parsedObj[i]["ticket_link"]="https://desertcommunityrobotics.com/wp-json/ee/v4.8.36/tickets?include=TKT_name%26where[Datetime.Event.EVT_ID]="+parsedObj[i]["EVT_ID"];
                // response.write("\t https://desertcommunityrobotics.com/wp-json/ee/v4.8.36/tickets?include=TKT_name%26where[Datetime.Event.EVT_ID]="+parsedObj[i]["EVT_ID"]+"\n");
            }
            response.write(JSON.stringify(parsedObj)); //Like I said, waiting until data retrieval ends. Shouldn't really slow anything down as this app should have a near-instant connection to the wp
            response.end();
        });
    });
}

function classes(search, response, request) {
    response = easyHeader(response);
    response.write("Hello world! This request was made to /classes");
    response.end();
}
function camps(search, response, request) {
    response = easyHeader(response);
    response.write("Hello world! this request was made to /camps with the filter \"" + search +"\"");
    response.end();
}

/* Useful functions */

function jsFriendlyJSONStringify(s) {
    return JSON.stringify(s, null, 2);
}

function easyHeader(response){
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    response.writeHead(200, {
        "Content-Type": "text/JSON"
    });
    return response;
}



exports.camps = camps;
exports.classes = classes;
exports.events = events;
exports.event = event;
exports.datetime = datetime;
exports.oldevents = oldevents;
