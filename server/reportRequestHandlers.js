var eeRequestHandlers     = require('./eeRequestHandlers.js');
var util                  = require('./util.js');

var getAnswers = function(req, mReq,regLbl,rspFunc){
  return function(data,err){
    if (err != ''){
      rspFunc(data,err); // There has been an error dont bother parsing
    } else {
      if (data[regLbl].length == 0){
        rspFunc(data,err); // no registrations...  return what we have
      } else {
        // iteratively pull /registrations/data[regLbl][idx]['REG_ID']/answers
        var startIdx = mReq.numReqs;
        mReq.addReqs(data[regLbl].length,rspFunc)
        data[regLbl].forEach(function(item, idx, array) {
          mReq.label[startIdx+idx] = regLbl+'_'+item['REG_ID']+'_Ans';
          eeRequestHandlers.eeParse(req, ('/ee/registrations/'+item['REG_ID']+'/answers').split('/'), null, mReq.passFunc[startIdx+idx]);
        });
      }      
    }
    return;
  };
}
var getRoster = function(req, splitPath, query, passFunc){
  if ( splitPath[3] != '' && splitPath[3] != undefined ) {
    if ( !isNaN(splitPath[3]) ) {
      var EVT_ID = splitPath[3];
      var EVT_LBL = 'Event_'+EVT_ID.toString();
      var EVT_REG_LBL = EVT_LBL+'_Regs';
      var reportMultiReq = new util.multiReq(0, passFunc);  //create the object with no reqs
      var ansPassFunc = getAnswers(req, reportMultiReq,EVT_REG_LBL,passFunc);

      reportMultiReq.addReqs(2, ansPassFunc);
      reportMultiReq.label[0] = EVT_LBL;
      reportMultiReq.label[1] = EVT_REG_LBL;
      eeRequestHandlers.eeParse(req, ('/ee/events/'+EVT_ID.toString()).split('/'), null, reportMultiReq.passFunc[0]);
      eeRequestHandlers.eeParse(req, ('/ee/events/'+EVT_ID.toString()+'/registrations').split('/'), null, reportMultiReq.passFunc[1]);
    } else {
      passFunc([],'getRoster Error: Invalid event ID: ' + splitPath[3] + ' from: ' + req.url);
    }
  } else {
    passFunc([],'getRoster Error: missinq required event ID from: ' + req.url);
  }      
  return;
}

function reportParse(req, splitPath, query, passFunc){

  switch (splitPath[2]) {
    case 'roster':
      getRoster(req, splitPath, query, passFunc);
      break;
    default:
      passFunc([],'reportParse Error: Unknown primary path: ' + splitPath[2] + ' from: ' + req.url);
      return;
  }

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
