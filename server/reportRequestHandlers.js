var eeRequestHandlers     = require('./eeRequestHandlers.js');
var util                  = require('./util.js');
var eeutil                = require('./eeUtil.js');

const EVT_LIST_LABEL = 'Event_List';


  var renderRoster = function renderRoster(myRsp, myRoster){
  return function (dat, err){
    var studentData = [] // Create array to store data for event students
//    if (data == []){
//      rspFunc(data,err); // no data in the requested regLbl so just return
//    } else {
//      if (err) {
//        console.log('gone');
//        console.log(err);
//        console.log(data);
//        passFunc(data,err);
//        util.sendResponse(myRsp, util.contType.TEXT, err );
//      } else {
//        myRsp.render('roster.njk', {title: title, studentData: studentData});
//      }
//    console.log(dat);
//    console.log(JSON.stringify(myRoster.data));
    var title = 'Roster for Event ' +  myRoster.eventID.toString() + ' (' + myRoster.data[this.evt_lbl]['EVT_name'] + ')';
//    var title = 'Temp Title';
    myRoster.reduceData (studentData);
    myRoster.eventID.toString() + ' (' + 
    myRsp.render('roster.njk', {title: title, studentData: studentData});
  }
}


var getEventRoster = function getEventRoster(req, splitPath, query, passFunc, rsp) {

  // Make sure we got an event ID passed in
  if ( splitPath[3] != '' && splitPath[3] != undefined ) {
    if ( isNaN(splitPath[3]) ) {
      passFunc([],'getRoster Error: Invalid event ID: ' + Event_ID + ' from: ' + req.url);
      return;
    }
  } else {
    passFunc([],'getRoster Error: missinq required event ID from: ' + req.url);
    return;
  }      

  var Event_ID = splitPath[3];
  var reportMultiReq = new util.multiReq(0, passFunc);  //create the webpage data fetching object

  var reportRoster = new eeutil.roster(req, reportMultiReq, query);


  reportRoster.fetchData(Event_ID,renderRoster(rsp, reportRoster));
  
}

var multiRenderRoster = function multiRenderRoster(evtID, evtTitle, data){
  var studentData = [];
//  console.log('Data for Event('+evtID+')');
//  console.log(data);
  //    if (data == []){
  //      rspFunc(data,err); // no data in the requested regLbl so just return
  //    } else {
  //      if (err) {
  //        console.log('gone');
  //        console.log(err);
  //        console.log(data);
  //        passFunc(data,err);
  //        util.sendResponse(rsp, util.contType.TEXT, err );
  //      } else {
  //        rsp.render('roster.njk', {title: title, studentData: studentData});
  //      }
  var title = 'Roster for Event ' +  evtID.toString() + ' (' + evtTitle + ')';
  reduceRosterData (data, evtID, studentData);
  console.log('Done with event('+ evtID.toString() +')');
}

var multiRosterFetch = function (req, mReq, query, curIdx, evtCnt, evtList, passFunc) {
  return function (data,err) {

    if ( evtCnt == 0 ) {
      curIdx = 0;
      console.log('Here');
      data[EVT_LIST_LABEL].forEach(function(item, idx, array) {
        evtCnt++;
      });
      console.log('There');
      evtList = data;
    }

    console.log('Event Count: ' + evtCnt.toString());
    console.log('Current Idx: ' + curIdx.toString());
    var evtID;
    var evtTitle;
    evtList[EVT_LIST_LABEL].forEach(function(item, idx, array) {
      if ( idx == curIdx ){
        evtID    = parseInt(item['EVT_ID']);
        evtTitle = item['EVT_name'];
        console.log('Hit!');
      }
    });

    console.log('Event Title: ' + evtTitle);
    console.log('Event ID: ' + evtID.toString());
    console.log('curIdx: ' + curIdx.toString());
    if (curIdx > 0 ){
      multiRenderRoster(evtID, evtTitle, data);
    }
    if ( curIdx == evtCnt-2 ) {
      passFunc(data,err);
      return;
    } else {
      curIdx++;
      getRosterData(req, mReq, evtID, query, multiRosterFetch(req, mReq, query, curIdx, evtCnt, evtList, passFunc));
      return;
    }
  };
}

var getWeeklyRoster = function getWeeklyRoster(req, splitPath, query, passFunc, rsp) {
  // correct query for a date range of events https://waybright.com/wp-json/ee/v4.8.36/events?where[Datetime.DTT_EVT_start][0]=BETWEEN&where[Datetime.DTT_EVT_start][1][]=2016-11-21T23:19:57&where[Datetime.DTT_EVT_start][1][]=2016-11-28T23:19:57
  // Pull the data
  
  var rspFuncs = [];
  
  var getRosters = function(){
    
  }

  var startIdx = 0;
  var startEvtCnt = 0;
  var startEvtList = [];

  var reportMultiReq = new util.multiReq(0, passFunc);  //create the webpage data fetching object
  console.log('Data it call1?');
  var EVT_LIST_IDX = reportMultiReq.addReqs(1, multiRosterFetch(req, reportMultiReq, query, startIdx, startEvtCnt, startEvtList, passFunc));
  console.log('Data it call2?');
  reportMultiReq.label[EVT_LIST_IDX] = EVT_LIST_LABEL;

  var requrl = 'https://waybright.com/wp-json/ee/v4.8.36/events?where[Datetime.DTT_EVT_start][0]=BETWEEN&where[Datetime.DTT_EVT_start][1][]=2016-11-21T23:19:57&where[Datetime.DTT_EVT_start][1][]=2016-11-28T23:19:57';
  reportMultiReq.getReq(EVT_LIST_IDX,requrl);
}

var reportParse = function reportParse(req, splitPath, query, passFunc, rsp){

  switch (splitPath[2]) {
    case 'roster':
      getEventRoster(req, splitPath, query, passFunc, rsp);
      break;
    case 'weekly_roster':
      getWeeklyRoster(req, splitPath, query, passFunc, rsp);
      break;
    default:
      passFunc([],'reportParse Error: Unknown primary path: ' + splitPath[2] + ' from: ' + req.url);
      return;
  }
}
// *************************************************************************//

var reportCheckAuth = function reportCheckAuth(splitPath){
  const authPaths = [];

  if ( authPaths.indexOf(splitPath[2]) > -1 ) {
    return true;
  }
  return false;
}

exports.reportParse     = reportParse;
exports.reportCheckAuth = reportCheckAuth;
