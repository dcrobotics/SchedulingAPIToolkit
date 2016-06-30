var reqs = [];

function requester(options, callBackFunc, parse, params, idx){
    return function(){
        var data = ""
        var xcallback = function (data, params, idx) {
             //will data be empty here? does xcallback preserve the empty data var or use the most recent one?
            if (parse === false) {
                callbackFunc(data, params, idx);
            } else {
                callbackFunc(JSON.parse(data), params, idx);
            }
        }
        var req = https.request(options, function(res){
            res.on("data", function(d){
                data+=d;
            });
            res.on("end", xcallback());
        });
    }
}

function call(fn){
    fn();
}

function addRequest(options, callBackFunc, parse, params){
    var idx = reqs.length;
    reqs.push(requester(options, callBackFunc, parse, params, idx));
    return idx;
}

function writeRequest(idx, data){
    reqs[idx].write(data);
}
function endRequest(idx){
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
