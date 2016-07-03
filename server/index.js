var http = require("http");
var url = require("url");

var requestHandlers = require("./requesthandlers");

var handle = {};

//TODO: separate these functions into different files by purpose
//TODO: encapsulate EE specific endpoint functions
handle["/"] = requestHandlers.camps;
handle["/camps/"] = requestHandlers.camps;
handle["/classes/"] = requestHandlers.classes;
handle["/oldevents/"] = requestHandlers.oldevents;
handle["/events/"] = requestHandlers.events;
handle["/event/"] = requestHandlers.event;
handle["/datetime/"] = requestHandlers.datetime;



function route(handle, pathname, search, root, response, request) {
    console.log("About to route a request for " + pathname);
    if (  !pathname.endsWith('/') ) {
      pathname = pathname + '/';
    }
    if (typeof handle[pathname] === 'function'){
        handle[pathname](search, response, request);
    } else {
        // handle non-root routes like /events/eventID
        console.log("No request handler found for " + pathname);
        response.writeHead(404, {"Content-Type":"text/plain"});
        response.write("404 Not Found");
        response.end();
    }
}

function start(route, handle) {
    function onRequest(request, response) {
        var pathname = url.parse(request.url).pathname;
        var search = url.parse(request.url).query;
        var root = pathname.split("/")
        console.log("Request for " + pathname + " received");
        route(handle, pathname, search, root, response, request);
    }
    http.createServer(onRequest).listen(8080);
    console.log("Server listening on port 8080");
}


start(route, handle);
