// var exec = require("child_process").exec;
var querystring = require("querystring");
var fs = require("fs");
var formidable = require("formidable");

function start(response, postData) {
    console.log("Request for handler 'start' was called");
    var body = '<html>'+
    '<head>'+
    '<meta http-equiv="Content-Type" content="text/html"/>'+
    '</head>'+
    '<body>'+
    '<form action="/upload" enctype="multipart/form-data" method="post">'+
    '<input type="file" name="upload" />'+
    '<input type="submit" value="Submit text" />'+
    '</form>'+
    '</body>'+
    '</html>';
    response.writeHead(200, {"Content-Type":"text/html"});
    response.write(body);
    response.end();
}
function upload(response, postData) {
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
        response.writeHead(200, {"Content-Type":"image/png"});
        response.write("received image: <br />");
        response.write("img src='/show' />");
        response.end();
    });

}
function show(response){
    console.log("Request handler 'show' was called.");
    response.writeHead(200, {"Content-Type":"image/png"});
    fs.createReadStream("/tmp/test.png").pipe(response);

}

exports.start = start;
exports.upload = upload;
exports.show = show;
