// var exec = require("child_process").exec;
var querystring = require("querystring");
var fs = require("fs");
var formidable = require("formidable");
var https = require("https");

var APIRef = {}
APIRef["camps"] = "/events"

//request = the response we send
function events(search, response, request) {
    var requrl = "https://desertcommunityrobotics.com/wp-json/ee/v4.8.29/events";
    https.get(requrl, function (res) {
        var resBody = ""; //the response we get
        res.on("data", function (chunk) {
            resBody += chunk; //we're going to wait until we have everything to send anything in case we want to deserialize the JSON or modify it in some way
        });
        res.on("end", function () {
            var resObj = JSON.parse(resBody);
            response.setHeader("Access-Control-Allow-Origin", "*");
            response.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            response.writeHead(200, {
                "Content-Type": "application/json"
            });

            response.write(jsFriendlyJSONStringify(resObj)); //Like I said, waiting until data retrieval ends. Shouldn't really slow anything down as this app should have a near-instant connection to the wp
            response.end();
        });
    });
}

function classes(search, response, request) {
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    response.writeHead(200, {
        "Content-Type": "text/plain"
    });
    response.write("Hello world! This request was made to /classes");
    response.end();
}
function camps(search, response, request) {
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    response.writeHead(200, {
        "Content-Type": "text/plain"
    });
    response.write("Hello world! this request was made to /camps with the filter \"" + search +"\"");
    response.end();
}

function jsFriendlyJSONStringify(s) {
    return JSON.stringify(s, null, 2);
}


exports.camps = camps;
exports.classes = classes;
 exports.events = events;
