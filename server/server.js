var http = require("http");
var url = require("url");

function start(route, handle) {
    function onRequest(request, response) {
        var pathname = url.parse(request.url).pathname;
        var search = url.parse(request.url).query;
        var root = pathname.split("/")
        console.log("Request for " + pathname + " received");
        route(handle, pathname, search, root, response, request);
    }
    http.createServer(onRequest).listen(8888);
    console.log("Server listening on port 8888");
}
exports.start = start;
