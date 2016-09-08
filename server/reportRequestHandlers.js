var eeRequestHandlers     = require('./eeRequestHandlers.js');
var util                  = require('./util.js');

function reportParse(req, splitPath, query, passFunc){

  var reportMultiReq = new util.multiReq(2, passFunc);

  reportMultiReq.label[0] = 'Event_5660';
  reportMultiReq.label[1] = 'Event_5665';
  eeRequestHandlers.eeParse(req, '/ee/events/5660'.split('/'), null, reportMultiReq.passFunc[0]);
  eeRequestHandlers.eeParse(req, '/ee/events/5665'.split('/'), null, reportMultiReq.passFunc[1]);

  return;
}
// *************************************************************************//

function reportCheckAuth(splitPath){
  const authPaths = [];

  if ( authPaths.indexOf(splitPath[2]) > -1 ) {
    return true;
  }
  return false;
}

exports.reportParse     = reportParse;
exports.reportCheckAuth = reportCheckAuth;
