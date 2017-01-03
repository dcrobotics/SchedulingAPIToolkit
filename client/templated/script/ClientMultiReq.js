
// Function to collect data and when it is all there, submit the response
// Requests that have the same rspFunc only call the call back if all of the data is there
var submitData = function (data,myIdx,myThis) {
  var rspRdy  = true;
  var rspData = '';
  var numRet  = 0;
  // Store the data for this call
  myThis.rdy[myIdx]  = true;
  myThis.data[myIdx] = myThis.xmlHttpReq[myIdx].responseText;

  // Find out if all the data is here for requests that have the same rspFunc
  for (ii = 0; ii < myThis.numReqs; ii++) {
    if (myThis.rspFunc[myIdx] === myThis.rspFunc[ii]) {
      rspRdy = rspRdy & myThis.rdy[ii];
      numRet++;
    }
  }
  // If it is merge it and send the response back
  if ( rspRdy ) {
    if (numRet > 1) {
      for (ii = 0; ii < myThis.numReqs; ii++) {
        if (myThis.rspFunc[myIdx] === myThis.rspFunc[ii]) {
          rspData = rspData.concat(myThis.data[ii]);
        }
      }
    } else {
      rspData = myThis.data[myIdx];
    }
    myThis.rspFunc[myIdx](rspData,numRet);
  }
};

// Generate the passFunc callback functions with the parameters they need to find their info
var passFuncGenerator = function (myIdx,myThis){
  return function(data){
    submitData(this.responseText,myIdx,myThis);
  };
};

function cliMultiReq(){
  this.numReqs    = 0;
  this.rdy        = [];
  this.data       = [];
  this.rspFunc    = [];
  this.label      = [];
  this.passFunc   = [];
  this.xmlHttpReq = [];
}

cliMultiReq.prototype.addReq = function (rspFunc, label, url, params) {
  var myReq = this.numReqs++;
  this.rspFunc.push(rspFunc);
  this.rdy.push(false);
  this.data.push([]);
  this.label.push(label);
  this.passFunc.push(passFuncGenerator(myReq,this));
  this.xmlHttpReq.push(new XMLHttpRequest);
  
  this.xmlHttpReq[myReq].addEventListener('load',this.passFunc[myReq]);
  this.xmlHttpReq[myReq].open('GET',url);
  this.xmlHttpReq[myReq].withCredentials = false;
  this.xmlHttpReq[myReq].send();
};  

cliMultiReq.prototype.addPost = function (rspFunc, label, url, params) {
  var myReq = this.numReqs++;
  this.rspFunc.push(rspFunc);
  this.rdy.push(false);
  this.data.push([]);
  this.label.push(label);
  this.passFunc.push(passFuncGenerator(myReq,this));
  this.xmlHttpReq.push(new XMLHttpRequest);
  
  this.xmlHttpReq[myReq].addEventListener('load',this.passFunc[myReq]);
  this.xmlHttpReq[myReq].addEventListener('error',this.passFunc[myReq]);
  this.xmlHttpReq[myReq].addEventListener('abort',this.passFunc[myReq]);
  this.xmlHttpReq[myReq].open('POST',url, true);
  this.xmlHttpReq[myReq].withCredentials = true;
  this.xmlHttpReq[myReq].setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  this.xmlHttpReq[myReq].send(params);
};  

