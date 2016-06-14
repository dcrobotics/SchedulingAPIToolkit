var server = require("./server");
var router = require("./router");
var reqestHandlers = require("./requestHandlers");

var handle = {};

handle["/"] = reqestHandlers.start;
handle["/start"] = reqestHandlers.start;
handle["/upload"] = reqestHandlers.upload;

server.start(router.route, handle);
