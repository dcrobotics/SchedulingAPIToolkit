//Significantly changed how this works (also fixed that scoping issue we were having)
//Now, requester is simply a shell function that returns the anonymous function that we actually want
//Apparently  in javascript if you save an anonymous function with specific arguments to a variable or an array,
//it preserves the state of those arguments. I guess that's how closures work lol.
//Anyway now we save these functions to an array, but unlike instantiating these functions as objects,
//they aren't evaluated when we create/save them. We can populate an array with requesters and choose
//to wait to dispatch them if we want. Kinda cool :)

//TODO: Match noderequester, bake callback into request object. Extend xmlhttprequest maybe? That shouldn't be too hard.
var reqs = [];

function requester(url, callbackFunc, parse, params, idx) {
    return function () {
        var xcallback = function () {
            if (parse === false) {
                callbackFunc(this.responseText, params, idx); //but params works just fine?
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
function addRequest(url, callBackFunc, parse, params){
    var idx = reqs.length;
    var xhr = new XMLHttpRequest;
    xhr.cbf = function(){
        callbackFunc(this.responseText, params, idx);
    }
    xhr.addEventListener("load", this.cbf); //will this work?
    reqs.push(requester(url, callBackFunc, parse, params, idx));
    dispatch(idx);
    return idx;
}

function dispatch(idx){
    call(reqs[idx]);
}

function dispatchAll(){
    reqs.forEach(call);
}
