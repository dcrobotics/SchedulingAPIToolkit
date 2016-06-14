function start() {
    console.log("Request for handler 'start' was called");
}
function upload() {
    console.log("Request for handler 'upload' was called");
}

exports.start = start;
exports.upload = upload;