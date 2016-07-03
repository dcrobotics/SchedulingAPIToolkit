var server = require("./server");
var router = require("./router");
var requestHandlers = require("./requesthandlers");

var handle = {};

//TODO: separate these functions into different files by purpose
//TODO: encapsulate EE specific endpoint functions
handle["/"] = requestHandlers.camps;
handle["/camps"] = requestHandlers.camps;
handle["/classes"] = requestHandlers.classes;
handle["/events"] = requestHandlers.events;
handle["/newevents"] = requestHandlers.newevents;
handle["/discover"] = requestHandlers.discover;

server.start(router.route, handle);
