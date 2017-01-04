var eeRequestHandlers     = require('./eeRequestHandlers.js');
var util                  = require('./util.js');
var eeutil                = require('./eeUtil.js');


var renderRoster = function renderRoster(myRsp, myRoster){
  return function (dat, err){
    var studentData = [] // Create array to store data for event students
//    if (data == []){
//      rspFunc(data,err); // no data in the requested regLbl so just return
//    } else {
//      if (err) {
//        passFunc(data,err);
//        util.sendResponse(myRsp, util.contType.TEXT, err );
//      } else {
//        myRsp.render('roster.njk', {title: title, studentData: studentData});
//      }
    var title = 'Roster for Event ' +  myRoster.eventID.toString() + ' (' + myRoster.data[myRoster.evt_lbl]['EVT_name'] + ')';
    myRoster.reduceData (studentData);
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

  var reportRoster = new eeutil.roster(req, query);
  reportRoster.fetchData(Event_ID,renderRoster(rsp, reportRoster));
}

var renderRosters = function renderRoster(myRsp, myMRoster){
  return function (dat, err){
    var rosters = [] // Create array to store data for event students
//    if (data == []){
//      rspFunc(data,err); // no data in the requested regLbl so just return
//    } else {
//      if (err) {
//        passFunc(data,err);
//        util.sendResponse(myRsp, util.contType.TEXT, err );
//      } else {
//        myRsp.render('roster.njk', {title: title, studentData: studentData});
//      }
    var title = 'Overall Title';
    for (ii = 0; ii < myMRoster.numRosters; ii++) {
      rosters.push({title:'', studentData:[]});
      if (myMRoster.rosters[ii].evt_lbl in myMRoster.rosters[ii].data){
        rosters[ii].title = 'Roster for Event ' +  myMRoster.rosters[ii].eventID.toString() + ' (' + myMRoster.rosters[ii].data[myMRoster.rosters[ii].evt_lbl]['EVT_name'] + ')';
      }
      myMRoster.rosters[ii].reduceData(rosters[ii].studentData);
    }
    myRsp.render('rosters.njk', {title: title, rosters: rosters});
  }
}

var getWeeklyRoster = function getWeeklyRoster(req, splitPath, query, passFunc, rsp) {
  var mRosters = new eeutil.multiRosters(req, query);
  var timeDate = new Date();
  mRosters.fetchRosters(timeDate,timeDate,renderRosters(rsp, mRosters));
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
