var http = require("http");
var url = require("url");

function start(route, handle) {
    function onRequest(request, response) {
        var pathname = url.parse(request.url).pathname;
        
        route(handle, pathname);
        
        response.writeHead(200, {
            "Content-Type": "text/plain"
        });
        response.write("Hello world! \n");
        response.end();
    }
    
    var server = http.createServer(onRequest);
    server.listen(8888);
    console.log("Server listening on port 8888");
}
exports.start = start;