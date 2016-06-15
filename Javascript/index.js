var server = require("./server");
var router = require("./router");
var reqestHandlers = require("./requestHandlers");

var handle = {};

handle["/"] = reqestHandlers.camps;
handle["/camps"] = reqestHandlers.camps;
// handle["/upload"] = reqestHandlers.upload;
// handle["/show"] = reqestHandlers.show;

server.start(router.route, handle);
