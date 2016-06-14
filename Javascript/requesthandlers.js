function start() {
    console.log("Request for handler 'start' was called");
}
function upload() {
    console.log("Request for handler 'upload' was called");
}
function camp() {
    console.log("Request for handler 'camp' was called");
}

exports.start = start;
exports.upload = upload;
