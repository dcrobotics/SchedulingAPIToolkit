var querystring = require("querystring");
var OAuth = require("oauth-1.0a");
var https = require("https");

var APIRef = {}
APIRef["camps"] = "/events"


var oauth = OAuth({
    consumer: {
        public: 'bJJSUlPkEM7A',
        secret: 'secret'
    },
    signature_method: 'HMAC-SHA1'
});

var oauth_token = "secret";
var oauth_verifier = "secret";
var wp_scope="*";
/* routing functions */

//response = the response we send
//request = the request that we recieved
//search = filter parameters I think

//TODO: clean this shit up
function testAuth(search, response, request){
    //useful: https://github.com/WP-API/OAuth1
    //HOW THE HELL DID THIS TAKE ME 3 DAYS TO FIND http://oauth1.wp-api.org
    //we use the oauth npm package to sign the thing or something. oauth.authorize gives me what the oauth bible says I need idk
    var request_data = { //Options for oauth.authorize
        url: 'https://desertcommunityrobotics.com/oauth1/request',
        method: 'POST',
        data: {
            oauth_callback: 'http://localhost:8888/authcallback'
        }
    };
    var authInfo = oauth.authorize(request_data); //Creates an object that store the requisite information we need to send to wordpress
    //Step 1 of http://oauthbible.com (three legged) comes from oath.authorize
    console.log(authInfo);
    var data = querystring.stringify(authInfo); //THIS TOOK FOREVER TO FIGURE OUT turns out you need to send this info as a query string
    console.log(data);
    var options = { //options required for the https request
        hostname: 'desertcommunityrobotics.com',
        port: 443,
        path: '/oauth1/request',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(data)
        }
    };
    var req = https.request(options, function(res){ //create the https request
        var resBody = "";
        res.on("data", function(d) { //get the response body and save it
            resBody+=d;
            // console.log("d: "+d);
        });
        res.on("end", function () {  //response is back, redirect the user and pass the oauth token.  SHOULD THIS BE POSTED?
            var tokenresponse = querystring.parse(resBody);
            response.writeHead(302, {
                'Location': 'https://desertcommunityrobotics.com/oauth1/authorize/?oauth_token='+tokenresponse.oauth_token
            });
            response.end();
        });
    });
    req.write(data);  //write the authorization info to the request
    // console.log(data);
    req.end();

    req.on('error', (e) => {
        console.error(e);
    });
}

//TODO: Clean up TK
function events(search, response, request) {
    var requrl = "https://desertcommunityrobotics.com/wp-json/ee/v4.8.29/events";
    https.get(requrl, function (res) {
        var resBody = ""; //the response we get
        res.on("data", function (chunk) {
            resBody += chunk; //we're going to wait until we have everything to send anything in case we want to deserialize the JSON or modify it in some way
        });
        res.on("end", function () {
            var parsedObj = JSON.parse(resBody); //parse the events
            response = easyHeader(response);

            for(var i = 0; i < parsedObj.length; i++){ //iterate through events
                // response.write("Event ID: " + parsedObj[i]["EVT_ID"] +"\n");
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
function authcallback(search, response, request){
    // console.log(request);\
    console.log(search);
    response = easyHeader(response);
    response.write(search);
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
        "Content-Type": "text/plain"
    });
    return response;
}



exports.camps = camps;
exports.classes = classes;
exports.events = events;
exports.testAuth = testAuth;
exports.authcallback = authcallback;
