var server = require("./server");
var router = require("./router");
var reqestHandlers = require("./requestHandlers");

var handle = {};

handle["/"] = reqestHandlers.camps;
handle["/camps"] = reqestHandlers.camps;
handle["/classes"] = reqestHandlers.classes;
// handle["/upload"] = reqestHandlers.upload;
handle["/events"] = reqestHandlers.events;
handle["/testAuth"] = reqestHandlers.testAuth;

server.start(router.route, handle);
