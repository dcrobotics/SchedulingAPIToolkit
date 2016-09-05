var eeRequestHandlers     = require('./eeRequestHandlers.js');
var util                  = require('./util.js');


function reportParse(req, splitPath, query, passFunc){
  
  var reportMultiReq = new util.multiReq(2, passFunc);
  
  var path1 = '/ee/events/5660';
  var splitPath1 = path1.split('/')
  reportMultiReq.label[0] = 'Event_5660';
  var path2 = '/ee/events/5665';
  var splitPath2 = path2.split('/')
  reportMultiReq.label[1] = 'Event_5665';
  eeRequestHandlers.eeParse(req, splitPath1, null, reportMultiReq.passFunc[0]);
  eeRequestHandlers.eeParse(req, splitPath2, null, reportMultiReq.passFunc[1]);

  return;
}
// *************************************************************************//

exports.reportParse = reportParse;
