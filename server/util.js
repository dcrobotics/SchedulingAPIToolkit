var http  = require('http');
var https = require('https');

var contType = {
  TEXT : 0,
  HTML : 1,
  JSON : 2
}

var setHeader = function setHeader(response, type){
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  switch (type){
    case contType.TEXT:
      response.writeHead(200, { 'Content-Type': 'text/plain' });
      break;
    case contType.HTML:
      response.writeHead(200, { 'Content-Type': 'text/html' });
      break;
    case contType.JSON:
      response.writeHead(200, { 'Content-Type': 'application/json' });
      break;
    default:
      console.log('warning unknown content type:' + type);
      response.writeHead(200, {'Content-Type': 'text/plain' });
      break;
  }
  return response;
}

var sendResponse = function sendResponse(response, type, responseData){
  response = setHeader(response,type);
  response.write(responseData );
  response.end();
}


// Function to collect data and when it is all there, submit the response
var submitRsp = function submitRsp(data,err,myIdx, myThis) {
  var rspRdy  = true;
  var rspErr  = '';
  var rspData = {};
  // Store the data for this call
  myThis.rdy[myIdx]  = true;
  myThis.data[myIdx] = data;
  myThis.err[myIdx]  = err;

  // Find out if all the data is here now
  for (ii = 0; ii < myThis.numReqs; ii++) {
    rspRdy = rspRdy & myThis.rdy[ii];
  }
  // If it is merge it and send the response back
  if ( rspRdy ) {
    for (ii = 0; ii < myThis.numReqs; ii++) {
      if ( myThis.err[ii] == '') {
        rspData[myThis.label[ii]] = myThis.data[ii];
      } else {
        if ( rspErr != '' ) {
          rspErr = rspErr + ' ';
        }
        rspErr = rspErr + 'Err[' + myThis.label[ii] + ']: ' + myThis.err[ii];
      }
    }
    myThis.rspFunc(rspData,rspErr);
  }
};

// Generate the passFunc callback functions with their index pre inserted
var passFuncGenerator = function passFuncGenerator(myIdx,myThis){
  return function(data,err){
    submitRsp(data,err,myIdx,myThis);
  };
};

// Class to manage requests for data from multiple web pages
// Set the number of requests that will be made and a callback
// to return all of the data and errors when the retreivals complete
// Set the label for each page called then make a call to retrieve
// each of the pages using this classes passFunc as the callback for returned data
var multiReq = function multiReq(numReqs, rspFunc) {
  this.numReqs   = 0;
  this.rdy       = [];
  this.data      = [];
  this.err       = [];
  this.passFunc  = [];
  this.label     = [];

  // Add the initial number of reqs
  this.addReqs(numReqs, rspFunc);
};

multiReq.prototype.addReqs = function addReqs(numAddReqs,rspFunc) {
  var startReqs = this.numReqs
  this.numReqs  += numAddReqs;
  this.rspFunc  = rspFunc;

  for (ii = startReqs; ii < this.numReqs; ii++) {
    this.rdy.push(false);
    this.data.push([]);
    this.err.push('');
    this.label.push(ii.toString());
    this.passFunc.push(passFuncGenerator(ii,this));
  }
  return startReqs;
};  

multiReq.prototype.getReq = function getReq(Idx,URL) {
  var reqRsp = function (myThis){
    return function(rsp){
      const statusCode = rsp.statusCode;
      const contentType = rsp.headers['content-type'];

      var reqErr;
      if (statusCode !== 200) {
        reqErr = new Error('Request Failed.\n' +
                          'Status Code: ${statusCode}');
      } else if (!/^application\/json/.test(contentType)) {
        reqErr = new Error('Invalid content-type.\n' +
                          'Expected application/json but received ${contentType}');
      }
      if (reqErr) {
        console.log('getReq: Error (' + error.message + ') fetching data from ' + URL);
        myThis.passFunc[Idx]('','getReq: Error (' + error.message + ') Getting Req from: ' + URL);
        rsp.resume();
        return;
      }

      rsp.setEncoding('utf8');
      var rawData = '';
        
      rsp.on('data', function (chunk) { rawData += chunk; }); //Incrementrally add response data
      rsp.on('end', function () {
          var parsedData = JSON.parse(rawData);
          myThis.passFunc[Idx](parsedData,'');
//        try {
//        } catch (err) {
//          console.log('getReq: Error (' + err.Message + ') parsing data from ' + URL);
//          myThis.passFunc[Idx]('','getReq: Error (' + err.Message + ') parsing data from: ' + URL);
//        }
      });
    }
  }
/*  .on('error', (err) => {
    console.log('getReq: Error (' + err.Message + ') parsing data from ' + URL);
    this.passFunc[Idx]('','getReq: Error (' + err.Message + ') parsing data from: ' + URL);
  });    
*/  
  if (URL.toLowerCase().startsWith('https')){
    https.get(URL, reqRsp(this));
  } else if (URL.toLowerCase().startsWith('http')) {
    http.get(URL, reqRsp(this));
  } else {
    this.passFunc[Idx]('','Invalid URL in getReq:'+URL);
  }
};  

exports.contType     = contType;
exports.setHeader    = setHeader;
exports.sendResponse = sendResponse;
exports.multiReq     = multiReq;
