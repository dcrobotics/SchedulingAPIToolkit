// var exec = require("child_process").exec;
var querystring = require("querystring");
var fs = require("fs");
var formidable = require("formidable");
var https = require("https");

//request = the response we send
function camps(response, request){
    var requrl = "https://desertcommunityrobotics.com/wp-json/ee/v4.8.29/events";
    https.get(requrl, function(res){
        var resBody = ""; //the response we get
        res.on("data", function(chunk){
            resBody+=chunk; //we're going to wait until we have everything to send anything in case we want to deserialize the JSON or modify it in some way
        });
        res.on("end", function(){
            var resObj = JSON.parse(resBody);
            response.writeHead(200, {"Content-Type":"application/json"});
            response.write(resBody); //Like I said, waiting until data retrieval ends. Shouldn't really slow anything down as this app should have a near-instant connection to the wp
            response.end();
        });
    });
}

function upload(response, request) {
    console.log("Request for handler 'upload' was called");

    var form = new formidable.IncomingForm();
    console.log("about to parse");
    form.parse(request, function(error, fields, files){
        console.log("done parsing");
        fs.rename(files.upload.path, "/tmp/test.png", function(error){
            if(error){
                fs.unlink("/tmp/test.png");
                fs.rename(files.upload.path, "/tmp/test.png");
            }
        });
        response.writeHead(200, {"Content-Type":"text/html"});
        response.write("received image: <br />");
        response.write("<img src='/show' />");
        response.end();
    });

}
function show(response){
    console.log("Request handler 'show' was called.");
    response.writeHead(200, {"Content-Type":"image/png"});
    fs.createReadStream("/tmp/test.png").pipe(response);
}

exports.camps = camps;
exports.upload = upload;
exports.show = show;
