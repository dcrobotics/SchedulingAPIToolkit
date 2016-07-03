//TODO: we should probably pass request objects around instead of ID's, it seems like it'd make more sense
var reqs = []; //an array of lonely functions just waiting for your call

//private, don't use
function requester(url, callbackFunc, parse, params, idx) {
    return function () {
        var xcallback = function () {
            if (parse === false) {
                callbackFunc(this.responseText, params, idx);
            } else {
                callbackFunc(JSON.parse(this.responseText), params, idx);
            }
        }
        var xhr = new XMLHttpRequest;
        xhr.addEventListener("load", xcallback);
        xhr.open("GET", url);
        xhr.send();
    }

}
function call(fn){
    fn();
}
//public: use this
function addRequest(url, callBackFunc, parse, params){
    var idx = reqs.length;
    reqs.push(requester(url, callBackFunc, parse, params, idx));
    return idx;
}

function dispatch(idx){ //call today ;)
    call(reqs[idx]);
}

function dispatchAll(){
    reqs.forEach(call);
}
