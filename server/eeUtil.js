var eeRequestHandlers = require('./eeRequestHandlers.js');
var util              = require('./util.js');

const REG_POSTFIX    = '_Regs';
const DTT_POSTFIX    = '_DTTs';
const TIK_POSTFIX    = '_Tiks';
const QUES_POSTFIX   = '_Qs';
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
          
          mReq.label[startIdx+idx] = regLbl+'_'+selfLink.replace('/', '_')+'_'+linkName;
          eeRequestHandlers.eeParse(req, ('/ee/' + dataLink).split('/'), query, mReq.passFunc[startIdx+idx]);
        });
      }      
    }
    return;
  };
}

var rosterSaveDataFunc = function rosterSaveDataFunc(myThis, passFunc){
  return function (dat, err){
    myThis.data    = dat;
    myThis.err     = err;
    passFunc(dat, err);
  };
}

var rosterProcRegDataFunc = function rosterProcRegDataFunc(myThis, passFunc){
  return function (dat, err){
    myThis.data    = dat;
    myThis.err     = err;
    myThis.numRegs = 0;

    if (myThis.evt_lbl + REG_POSTFIX in myThis.data){
      myThis.data[myThis.evt_lbl + REG_POSTFIX].forEach(function(item, idx, array) {
        if (item['REG_deleted'] == false){
          myThis.numRegs++;
          myThis.regNumbers.push(item['REG_ID']);
        }
      });

      var tiksStartIdx = myThis.multiReq.addReqs(myThis.numRegs, rosterSaveDataFunc(myThis,passFunc));

      for (ii = 0; ii < myThis.numRegs; ii++){
		var dateTimesURL = '/ee/tickets/' + myThis.data[myThis.evt_lbl + REG_POSTFIX + '_registrations_' + myThis.regNumbers[ii].toString() + '_ticket']['TKT_ID'] + '/datetimes'
        myThis.multiReq.label[tiksStartIdx + ii] = myThis.evt_lbl + TIK_POSTFIX + '_Reg_' + myThis.regNumbers[ii] + '_DateTimes';
        eeRequestHandlers.eeParse(myThis.httpReq, dateTimesURL.split('/'), null, myThis.multiReq.passFunc[tiksStartIdx + ii]);
      }
	  if (myThis.numRegs == 0){
        passFunc(dat, err);
	  }
    } else {
      passFunc(dat, err);
	}
    
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
  this.regNumbers   = [];
};

roster.prototype.fetchData = function rosterFetchData(evtID, rspFunc){
  this.eventID      = evtID;
  this.passFunc     = rspFunc;
  this.multiReq     = new util.multiReq(0, this.passFunc)
  this.evt_lbl      = 'Event_'+this.eventID.toString();

  var rosterProcPassFunc = rosterProcRegDataFunc(this, rspFunc)
  var tikPassFunc  = getLinkedData(this.httpReq, this.multiReq,this.evt_lbl+REG_POSTFIX,'ticket',null,rosterProcPassFunc);
  var statPassFunc = getLinkedData(this.httpReq, this.multiReq,this.evt_lbl+REG_POSTFIX,'status',null,tikPassFunc);
  var attPassFunc  = getLinkedData(this.httpReq, this.multiReq,this.evt_lbl+REG_POSTFIX,'attendee',null,statPassFunc);
  var ansPassFunc  = getLinkedData(this.httpReq, this.multiReq,this.evt_lbl+REG_POSTFIX,'answers',null,attPassFunc);

  var regIdx = this.multiReq.addReqs(3, ansPassFunc);
  this.multiReq.label[regIdx]   = this.evt_lbl;
  this.multiReq.label[regIdx+1] = this.evt_lbl+DTT_POSTFIX;;
  this.multiReq.label[regIdx+2] = this.evt_lbl+REG_POSTFIX;;
  eeRequestHandlers.eeParse(this.httpReq, ('/ee/events/'+this.eventID.toString()).split('/'), 'limit=70', this.multiReq.passFunc[regIdx]);
  eeRequestHandlers.eeParse(this.httpReq, ('/ee/events/'+this.eventID.toString()+'/datetimes').split('/'), 'limit=70', this.multiReq.passFunc[regIdx+1]);
  eeRequestHandlers.eeParse(this.httpReq, ('/ee/events/'+this.eventID.toString()+'/registrations').split('/'), 'limit=96', this.multiReq.passFunc[regIdx+2]);
}

roster.prototype.reduceData = function reduceData(studentData){
  var ii = -1;
  var jj = -1;
  var minAnsID;
  var myThis = this;
  this.data[this.evt_lbl + REG_POSTFIX].forEach(function(item, idx, array) {
    if (item['REG_deleted'] == false){
      ii++;
      if (myThis.evt_lbl+REG_POSTFIX+'_registrations_'+myThis.regNumbers[ii]+'_status' in myThis.data){
        if ('STS_code' in myThis.data[myThis.evt_lbl+REG_POSTFIX+'_registrations_'+myThis.regNumbers[ii]+'_status']){
          var statusCode = myThis.data[myThis.evt_lbl+REG_POSTFIX+'_registrations_'+myThis.regNumbers[ii]+'_status']['STS_code'];
        }
      }
      if ((statusCode === 'APPROVED') || (statusCode === 'PENDING_PAYMENT')){
        jj++;
        studentData.push({regStatus:'', studentName:'', studentDOB:'', studentAge:'', studentGender:'', studentPhone:'', ParentName:'', ParentEMail:'', TicketName:'', TicketPrice:-1, TicketStart:[], TicketEnd:[], TicketStartTxt:'', TicketEndTxt:''});
        studentData[jj]['regStatus']  = statusCode;

        if (myThis.evt_lbl+REG_POSTFIX+'_registrations_'+myThis.regNumbers[ii]+'_answers' in myThis.data){
          minAnsID = 999999999999999;
          myThis.data[myThis.evt_lbl+REG_POSTFIX+'_registrations_'+myThis.regNumbers[ii]+'_answers'].forEach(function(item, idx, array) {
            if ( item['ANS_ID'] < minAnsID ) { minAnsID = item['ANS_ID']; }
          });
          myThis.data[myThis.evt_lbl+REG_POSTFIX+'_registrations_'+myThis.regNumbers[ii]+'_answers'].forEach(function(item, idx, array) {
            switch (item['ANS_ID']) {
            case minAnsID:
              studentData[jj]['studentName'] = item['ANS_value'].slice();
              break;
            case minAnsID+1:
              studentData[jj]['studentDOB'] = item['ANS_value'].slice();
              break;
            case minAnsID+2:
              studentData[jj]['studentAge'] = item['ANS_value'].slice();
              break;
            case minAnsID+3:
              studentData[jj]['studentGender'] = item['ANS_value'].slice();
              break;
            case minAnsID+4:
              studentData[jj]['studentPhone'] = item['ANS_value'].slice();
              break;
            default:
            }
          });
        }

		if (myThis.evt_lbl+ TIK_POSTFIX + '_Reg_' + myThis.regNumbers[ii] + '_DateTimes' in myThis.data){
          myThis.data[myThis.evt_lbl+TIK_POSTFIX+ '_Reg_' + myThis.regNumbers[ii] + '_DateTimes'].forEach(function(item, idx, array) {
			var splitData = item['DTT_EVT_start'].split('T');
			var splitDate = splitData[0].split('-');
			var splitTime = splitData[1].split(':');
			ticketDate = new Date(splitDate[0], splitDate[1]-1, splitDate[2], splitTime[0], splitTime[1], 0, 0);
			
			if (idx == 0) {
              studentData[jj]['TicketStart'] = new Date(ticketDate.getTime());
              studentData[jj]['TicketEnd']   = new Date(ticketDate.getTime());
			} else {
			  if (studentData[jj]['TicketStart'] > ticketDate){studentData[jj]['TicketStart'] = new Date(ticketDate.getTime());}
			  if (studentData[jj]['TicketEnd']   < ticketDate){studentData[jj]['TicketEnd']   = new Date(ticketDate.getTime());}
			}
		  });
		  studentData[jj]['TicketStartTxt'] = util.getDateTimeString(studentData[jj]['TicketStart']);
		  studentData[jj]['TicketEndTxt']   = util.getDateTimeString(studentData[jj]['TicketEnd']);
        }
		
        if (myThis.evt_lbl+REG_POSTFIX+'_registrations_'+myThis.regNumbers[ii]+'_ticket' in myThis.data){
          if ('TKT_name' in myThis.data[myThis.evt_lbl+REG_POSTFIX+'_registrations_'+myThis.regNumbers[ii]+'_ticket']){
            studentData[jj]['TicketName']  = myThis.data[myThis.evt_lbl+REG_POSTFIX+'_registrations_'+myThis.regNumbers[ii]+'_ticket']['TKT_name'];
          }
        }
        if (myThis.evt_lbl+REG_POSTFIX+'_registrations_'+myThis.regNumbers[ii]+'_ticket' in myThis.data){
          if ('TKT_price' in myThis.data[myThis.evt_lbl+REG_POSTFIX+'_registrations_'+myThis.regNumbers[ii]+'_ticket']){
            if ('pretty' in myThis.data[myThis.evt_lbl+REG_POSTFIX+'_registrations_'+myThis.regNumbers[ii]+'_ticket']['TKT_price']){
              studentData[jj]['TicketPrice']  = myThis.data[myThis.evt_lbl+REG_POSTFIX+'_registrations_'+myThis.regNumbers[ii]+'_ticket']['TKT_price']['pretty'];
              studentData[jj]['TicketPrice'] = studentData[jj]['TicketPrice'].slice(0,studentData[jj]['TicketPrice'].indexOf('.')+3)
            }
          }
        }
        if (myThis.evt_lbl+REG_POSTFIX+'_registrations_'+myThis.regNumbers[ii]+'_attendee' in myThis.data){
          if ('ATT_full_name' in myThis.data[myThis.evt_lbl+REG_POSTFIX+'_registrations_'+myThis.regNumbers[ii]+'_attendee']){
            studentData[jj]['ParentName']  = myThis.data[myThis.evt_lbl+REG_POSTFIX+'_registrations_'+myThis.regNumbers[ii]+'_attendee']['ATT_full_name'];
          }
          if ('ATT_email' in myThis.data[myThis.evt_lbl+REG_POSTFIX+'_registrations_'+myThis.regNumbers[ii]+'_attendee']){
            studentData[jj]['ParentEMail'] = myThis.data[myThis.evt_lbl+REG_POSTFIX+'_registrations_'+myThis.regNumbers[ii]+'_attendee']['ATT_email'];
          }
        }
      }
	  }
  });
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

  var requrl = 'https://waybright.com/wp-json/ee/v4.8.36/events?where[Datetime.DTT_EVT_start][0]=BETWEEN&where[Datetime.DTT_EVT_start][1][]=2017-07-13T00:00:00&where[Datetime.DTT_EVT_start][1][]=2017-07-27T00:00:00&li‌​mit=2000';
  this.mReq.getReq(EVT_LIST_IDX,requrl);
}

exports.roster        = roster;
exports.multiRosters  = multiRosters;
