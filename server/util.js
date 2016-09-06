var contType = {
  TEXT : 0,
  HTML : 1,
  JSON : 2
}

function setHeader(response, type){
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
function sendResponse(response, type, responseData){
  response = setHeader(response,type);
  response.write(responseData );
  response.end();
}

var multiReq = function (numReqs, rspFunc) {
  var classThis  = this; // Keep track of this
  this.numReqs   = numReqs;
  this.rspFunc   = rspFunc;
  this.rdy       = [];
  this.data      = [];
  this.err       = [];
  this.passFunc  = [];
  this.label     = [];

  // Function to collect data and when it is all there, submit the response
  var submitRsp = function(data,err,idx) {
    var rspRdy  = true;
    var rspErr  = '';
    var rspData = {};
    // Store the data for this call
    classThis.rdy[idx]  = true;
    classThis.data[idx] = data;
    classThis.err[idx]  = err;

    // Find out if all the data is here now
    for (ii = 0; ii < classThis.numReqs; ii++) { 
      rspRdy = rspRdy & classThis.rdy[ii];
    }
    // If it is merge it and send the response back
    if ( rspRdy ) {
      for (ii = 0; ii < classThis.numReqs; ii++) {
        if ( classThis.err[ii] == '') {
          rspData[classThis.label[ii]] = classThis.data[ii];
        } else {
          if ( rspErr != '' ) {
            rspErr = rspErr + ' ';
          }
          rspErr = rspErr + 'Err[' + classThis.label[ii] + ']: ' + classThis.err[ii];
        }        
      }
      classThis.rspFunc(rspData,rspErr);
    }
  };
  
  // Generate the passFunc callback functions with their index pre inserted
  var passFuncGenerator = function (idx){
    return function(data,err){
      submitRsp(data,err,idx);
    };
  };
  
  // Initialize arrays
  for (ii = 0; ii < numReqs; ii++) { 
    this.rdy.push(false);
    this.data.push([]);
    this.err.push('');
    this.label.push(ii.toString());
    this.passFunc.push(passFuncGenerator(ii));
  }
};


exports.contType     = contType;
exports.setHeader    = setHeader;
exports.sendResponse = sendResponse;
exports.multiReq     = multiReq;
