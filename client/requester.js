function requester(url, callbackFunc, parse, inputParams){
    this.callerbackgurl = function(){
        //figure out scoping issues for this.params, etc.
        //take a look at http://www.w3schools.com/js/tryit.asp?filename=tryjs_object_prototype7
        console.log("callerbackgurl inputParams: " + inputParams);
        if(parse===false){
            callbackFunc(this.responseText, inputParams);
        } else {
            callbackFunc(JSON.parse(this.responseText), inputParams);
        }
    }
    this.inputParams = inputParams;
    this.url = url;
    this.xhr = new XMLHttpRequest;
    this.xhr.addEventListener("load", this.callerbackgurl);
    this.xhr.open("GET", this.url);
    this.xhr.send();
}
