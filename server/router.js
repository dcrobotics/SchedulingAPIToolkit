function route(handle, pathname, search, root, response, request) {
    console.log("About to route a request for " + pathname);
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
exports.route = route;
