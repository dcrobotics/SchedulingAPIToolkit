//figure out scoping issues for this.params, etc.
//take a look at http://www.w3schools.com/js/tryit.asp?filename=tryjs_object_prototype7

//Does it have to do with the face that xcallback is being used as a callback but test is just being called normally?

function requester(url, callbackFunc, parse, params) {
    this.inputParams = params;
    this.test = function () {
        console.log("this.inputParams in this.test: " + this.inputParams);  //This works completely fine
    }
    this.xcallback = function () {
        console.log("this.inputParams in this.xcallback: " + this.inputParams);  //this.inputparams always shows up as undefined
        if(parse===false){
            callbackFunc(this.responseText, params);   //but params works just fine?
        } else {
            callbackFunc(JSON.parse(this.responseText), params);
        }
    }
    this.url = url;
    this.xhr = new XMLHttpRequest;
    this.xhr.addEventListener("load", this.xcallback);
    this.xhr.open("GET", this.url);
    this.xhr.send();
    this.test();
}
