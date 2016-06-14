var exec = require("child_process").exec;
function start(response) {
    console.log("Request for handler 'start' was called");
    exec("ls -lah", function (error, stdout, stderr){
        response.writeHead(200, {"Content-Type":"text/plain"});
        response.write(stdout);
        response.end();
    });
}
function upload(response) {
    console.log("Request for handler 'upload' was called");
    response.writeHead(200, {"Content-Type":"text/plain"});
    response.write("GET YOUR ENGINES STARTED!!!!!");
    response.end();
}
function camp(response) {
    console.log("Request for handler 'camp' was called");
    response.writeHead(200, {"Content-Type":"text/plain"});
    response.write("I'm going camping and I'm going to bring...");
    response.end();
}

exports.start = start;
exports.upload = upload;
