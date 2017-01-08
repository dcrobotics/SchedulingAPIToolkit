var eeRequestHandlers = require('./eeRequestHandlers.js');
var util              = require('./util.js');

const REG_POSTFIX    = '_Regs';
const EVT_LIST_LABEL = 'Event_List';

// Pulls "linked" data from an Event Espresso Item
var getLinkedData = function getLinkedData(req, mReq, regLbl, linkName, query, rspFunc){
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
          eeRequestHandlers.eeParse(req, ('/ee/' + dataLink).split('/'), query, mReq.passFunc[startIdx+idx]);
        });
      }      
    }
    return;
  };
}

var rosterSaveRspFunc = function rosterSaveRspFunc(myThis){
  return function (dat, err){
    myThis.data    = dat;
    myThis.err     = err;
    myThis.numRegs = 0;
    if (myThis.evt_lbl + REG_POSTFIX in myThis.data){
      myThis.data[myThis.evt_lbl + REG_POSTFIX].forEach(function(item, idx, array) {
        myThis.numRegs++;
      });
    }
    myThis.passFunc(dat,err);
  };
}

var roster = function roster(req, query) {
  this.httpReq      = req;
  this.multiReq     = null; 
  this.httpQuery    = query;
  this.data         = [];
  this.err          = '';
  this.eventID      = 0;
  this.passFunc     = null;
  this.evt_lbl      = 'Unititialized';
  this.numRegs      = 0;
};

roster.prototype.fetchData = function rosterFetchData(evtID, rspFunc){
  this.eventID      = evtID;
  this.passFunc     = rspFunc;
  this.multiReq     = new util.multiReq(0, this.passFunc)
  this.evt_lbl      = 'Event_'+this.eventID.toString();

  // Get answers first then Attendees
  var attPassFunc = getLinkedData(this.httpReq, this.multiReq,this.evt_lbl+REG_POSTFIX,'attendee',null,rosterSaveRspFunc(this));
  var ansPassFunc = getLinkedData(this.httpReq, this.multiReq,this.evt_lbl+REG_POSTFIX,'answers',null,attPassFunc);

  var regIdx = this.multiReq.addReqs(2, ansPassFunc);
  this.multiReq.label[regIdx]   = this.evt_lbl;
  this.multiReq.label[regIdx+1] = this.evt_lbl+REG_POSTFIX;;
  eeRequestHandlers.eeParse(this.httpReq, ('/ee/events/'+this.eventID.toString()).split('/'), this.httpQuery, this.multiReq.passFunc[regIdx]);
  eeRequestHandlers.eeParse(this.httpReq, ('/ee/events/'+this.eventID.toString()+'/registrations').split('/'), null, this.multiReq.passFunc[regIdx+1]);
}

roster.prototype.reduceData = function reduceData(studentData){
  var regNumbers = [];
  // pull the requested linked data for each item in regLbl
  if (this.evt_lbl + REG_POSTFIX in this.data){
    this.data[this.evt_lbl + REG_POSTFIX].forEach(function(item, idx, array) {
      regNumbers.push(item['REG_ID']);
    });
  }
  var ii;
  var minAnsID;
  for (ii = 0 ; ii < this.numRegs ; ii++){
    studentData[ii] = {studentName:'', studentDOB:'', studentAge:'', studentGender:'', studentPhone:'', ParentName:'', ParentEMail:''};

    if (this.evt_lbl+REG_POSTFIX+'_registrations/'+regNumbers[ii]+'_answers' in this.data){
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
    }
    if (this.evt_lbl+REG_POSTFIX+'_registrations/'+regNumbers[ii]+'_attendee' in this.data){
      if ('ATT_full_name' in this.data[this.evt_lbl+REG_POSTFIX+'_registrations/'+regNumbers[ii]+'_attendee']){
        studentData[ii]['ParentName']  = this.data[this.evt_lbl+REG_POSTFIX+'_registrations/'+regNumbers[ii]+'_attendee']['ATT_full_name'];
      }
      if ('ATT_email' in this.data[this.evt_lbl+REG_POSTFIX+'_registrations/'+regNumbers[ii]+'_attendee']){
        studentData[ii]['ParentEMail'] = this.data[this.evt_lbl+REG_POSTFIX+'_registrations/'+regNumbers[ii]+'_attendee']['ATT_email'];
      }
    }
  }
}

// Generate the passFunc callback functions with their index pre inserted
var chainFetchRoster = function chainFetchRoster(myThis,myIdx){
  return function(dat,err){
    if (myIdx < myThis.numRosters-1) {
      myThis.rosters[myIdx].fetchData(myThis.eventIDs[myIdx],chainFetchRoster(myThis, myIdx+1));
    } else {
      myThis.rFunc(dat,err);
    }
  }
}

var parseRostersFunc = function parseRostersFunc(myThis){
  return function (dat,err) {
    myThis.data       = dat;
    myThis.err        = err;
    myThis.numRosters = 0;
    
    myThis.data[EVT_LIST_LABEL].forEach(function(item, idx, array) {
      myThis.numRosters++;
      myThis.eventIDs.push(parseInt(item['EVT_ID']));
      myThis.rosters.push(new roster(myThis.httpReq, null));
    });

    if (myThis.numRosters > 0 ){
      myThis.rosters[0].fetchData(myThis.eventIDs[0],chainFetchRoster(myThis,0));
    } else {
      myThis.rFunc([],'MultiRoster parse error.  No rosters found from: ' + myThis.httpReq.url);
    }
  }
}

var multiRosters = function multiRosters(req, query) {
  this.httpReq      = req;
  this.httpQuery    = query;
  this.sDate        = null;
  this.eDate        = null;
  this.mReq         = null;
  this.rFunc        = null;
  this.numRosters   = 0;
  this.rosters      = [];
  this.eventIDs     = [];
  this.data         = [];
  this.err          = '';
}

multiRosters.prototype.fetchRosters = function multiRosterFetchData(startDate, endDate, rspFunc){
  this.sDate        = startDate;
  this.eDate        = endDate;
  this.rFunc        = rspFunc;
  this.mReq         = new util.multiReq(0, this.rFunc);  //create the webpage data fetching object

  var startIdx = 0;
  var startEvtCnt = 0;
  var startEvtList = [];

  var EVT_LIST_IDX = this.mReq.addReqs(1, parseRostersFunc(this));
  this.mReq.label[EVT_LIST_IDX] = EVT_LIST_LABEL;

  var requrl = 'https://waybright.com/wp-json/ee/v4.8.36/events?where[Datetime.DTT_EVT_start][0]=BETWEEN&where[Datetime.DTT_EVT_start][1][]=2017-01-08T23:59:59&where[Datetime.DTT_EVT_start][1][]=2017-01-15T23:59:59&li‌​mit=2000';
  this.mReq.getReq(EVT_LIST_IDX,requrl);
}

exports.roster        = roster;
exports.multiRosters  = multiRosters;
