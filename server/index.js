var server = require("./server");
var router = require("./router");
var requestHandlers = require("./requestHandlers");
var authentication = require("./authentication");

var handle = {};

//TODO: separate these functions into different files by purpose
//TODO: encapsulate EE specific endpoint functions
handle["/"] = requestHandlers.camps;
handle["/camps"] = requestHandlers.camps;
handle["/classes"] = requestHandlers.classes;
handle["/events"] = requestHandlers.events;
handle["/testAuth"] = requestHandlers.testAuth;
handle["/authcallback"] = authentication.authcallback;
handle["/authorize"] = authentication.authorize;


server.start(router.route, handle);
