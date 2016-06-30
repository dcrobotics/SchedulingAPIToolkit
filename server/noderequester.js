var https = require("https");
var reqs = [];

//unfortunately, the requests call themselves. This works differently than the browser side, does that matter?

function call(fn){
    fn();
}

function addRequest(options, callBackFunc, params){
    var idx = reqs.length;
    var req = https.request(options, function(res){
        var data = ""
        res.on("data", function(d){
            data+=d;
            console.log(data);
        });
        res.on("end", function () {
            callBackFunc(data, params, idx);
        });
    });
    reqs.push(req);
    return idx;
}

function writeRequest(idx, data){
    console.log("writing " + idx)
    console.log("reqs: " + reqs);
    reqs[idx].write(data);
}
function endRequest(idx){
    console.log("ending " + idx);
    reqs[idx].end();
}
function dispatchRequest(idx){
    call(reqs[idx]);
}

function dispathAll(){
    reqs.forEach(call);
}

exports.addRequest = addRequest;
exports.writeRequest = writeRequest;
exports.endRequest = endRequest;
exports.dispatchRequest = dispatchRequest;
exports.dispathAll = dispathAll;
