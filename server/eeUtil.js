var eeRequestHandlers     = require('./eeRequestHandlers.js');

const REG_POSTFIX = '_Regs';
  
// Pulls "linked" data from an Event Espresso Item
var getLinkedData = function getLinkedData(req, mReq, regLbl, linkName, rspFunc){
  return function(data,err){
    const LINK_PREFIX = 'https://api.eventespresso.com/'
    if (err != ''){
      rspFunc(data,err); // There has been an error dont bother parsing
    } else {
      if (data[regLbl].length == 0){
        rspFunc(data,err); // no data in the requested regLbl so just return
      } else {
        // pull the requested linked data for each item in regLbl
        var startIdx = mReq.addReqs(data[regLbl].length,rspFunc)
        data[regLbl].forEach(function(item, idx, array) {
          // Create a label using the self link
          var selfLink = item['_links']['self'][0]['href']
          selfLink = selfLink.slice(selfLink.indexOf('/ee/')+4)
          selfLink = selfLink.slice(selfLink.indexOf('/')+1)
          // find the link to the data and parse out what we need
          var dataLink = item['_links'][LINK_PREFIX+linkName][0]['href']
          dataLink = dataLink.slice(dataLink.indexOf('/ee/')+4)
          dataLink = dataLink.slice(dataLink.indexOf('/')+1)
          
          mReq.label[startIdx+idx] = regLbl+'_'+selfLink+'_'+linkName;
          eeRequestHandlers.eeParse(req, ('/ee/' + dataLink).split('/'), null, mReq.passFunc[startIdx+idx]);
        });
      }      
    }
    return;
  };
}

var dataSaveFunc = function dataSaveFunc(myThis){
  return function (dat, err){
    myThis.data = dat;
    myThis.err  = err;
    myThis.passFunc(dat,err);
    return;
  };
};

var roster = function rotster(req, mReq, query) {
  this.httpReq      = req;
  this.multiReq     = mReq;
  this.httpQuery    = query;
  this.data         = [];
  this.err          = '';
};

roster.prototype.fetchData = function fetchData(evtID, rspFunc){
  this.eventID      = evtID;
  this.passFunc     = rspFunc;
  this.evt_lbl      = 'Event_'+this.eventID.toString();

  // Get answers first then Attendees
  var attPassFunc = getLinkedData(this.httpReq, this.multiReq,this.evt_lbl + REG_POSTFIX,'attendee',dataSaveFunc(this));
  var ansPassFunc = getLinkedData(this.httpReq, this.multiReq,this.evt_lbl + REG_POSTFIX,'answers',attPassFunc);

  var regIdx = this.multiReq.addReqs(2, ansPassFunc);
  this.multiReq.label[regIdx]   = this.evt_lbl;
  this.multiReq.label[regIdx+1] = this.evt_lbl + REG_POSTFIX;;
  eeRequestHandlers.eeParse(this.httpReq, ('/ee/events/'+this.eventID.toString()).split('/'), this.httpQuery, this.multiReq.passFunc[regIdx]);
  eeRequestHandlers.eeParse(this.httpReq, ('/ee/events/'+this.eventID.toString()+'/registrations').split('/'), this.httpQuery, this.multiReq.passFunc[regIdx+1]);
  return;

}

roster.prototype.reduceData = function reduceData(studentData){

  var regNumbers = [];
  // pull the requested linked data for each item in regLbl
  this.data[this.evt_lbl + REG_POSTFIX].forEach(function(item, idx, array) {
    regNumbers.push(item['REG_ID']);
  });
  var ii;
  var minAnsID;
  for (ii = 0 ; ii < regNumbers.length ; ii++){
    studentData[ii]=[]
    minAnsID = 999999999999999;
    this.data[this.evt_lbl+REG_POSTFIX+'_registrations/'+regNumbers[ii]+'_answers'].forEach(function(item, idx, array) {
      if ( item['ANS_ID'] < minAnsID ) { minAnsID = item['ANS_ID']; }
    });
    this.data[this.evt_lbl+REG_POSTFIX+'_registrations/'+regNumbers[ii]+'_answers'].forEach(function(item, idx, array) {
      switch (item['ANS_ID']) {
        case minAnsID:
          studentData[ii]['studentName'] = item['ANS_value'].slice();
          break;
        case minAnsID+1:
          studentData[ii]['studentDOB'] = item['ANS_value'].slice();
          break;
        case minAnsID+2:
          studentData[ii]['studentAge'] = item['ANS_value'].slice();
          break;
        case minAnsID+3:
          studentData[ii]['studentGender'] = item['ANS_value'].slice();
          break;
        case minAnsID+4:
          studentData[ii]['studentPhone'] = item['ANS_value'].slice();
          break;
        default:
      }
    });
    studentData[ii]['ParentName']  = this.data[this.evt_lbl+REG_POSTFIX+'_registrations/'+regNumbers[ii]+'_attendee']['ATT_full_name'];
    studentData[ii]['ParentEMail'] = this.data[this.evt_lbl+REG_POSTFIX+'_registrations/'+regNumbers[ii]+'_attendee']['ATT_email'];
  }
}

exports.roster     = roster;
