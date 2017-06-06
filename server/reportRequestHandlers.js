var eeRequestHandlers     = require('./eeRequestHandlers.js');
var util                  = require('./util.js');
var eeutil                = require('./eeUtil.js');

var renderRoster = function renderRoster(myRsp, myRoster, renderFile){
  return function (dat, err){
    var rosters = []; // Create array to store data for event students
    var curRoster = 0;
    var emptyCourses = [];
    var curEmptyCourse = 0;

    var title = 'Event Roster';
    if (myRoster.numRegs > 0 ){
      rosters.push({evtID:'', evtName:'', studentData:[], emailList:''});
      if (myRoster.evt_lbl in myRoster.data){
        rosters[curRoster].evtID      = myRoster.eventID.toString();
        rosters[curRoster].evtName    = myRoster.data[myRoster.evt_lbl]['EVT_name'];
      }
	  myRoster.reduceData(rosters[curRoster].studentData);
	  // Sort by Ticket Name
	  rosters[curRoster].studentData.sort(function (a, b){
        if (a['TicketStart'] <   b['TicketStart']) {return -1;}
        if (a['TicketStart'] >   b['TicketStart']) {return  1;}
		if (a['TicketStart'] === b['TicketStart']) {
	      if (a['studentName'] <   b['studentName']) {return -1;}
          if (a['studentName'] >   b['studentName']) {return  1;}
		}
        return 0;
	  });
      var inBetween = '';
      var curTicket = [];
      rosters[curRoster].studentData.forEach(function(item, idx, array) {
        if (idx == 0){
          curTicket = new Date(item.TicketStart.getTime());
          if (item.ParentEMail != ''){
            rosters[curRoster].emailList = item.ParentEMail;
            inBetween = ', ';
          }
      	} else {
          if (item.TicketStart > curTicket) {
            curTicket = new Date(item.TicketStart.getTime());
            if (inBetween !== ''){inBetween = ' ';}
            rosters[curRoster].emailList = rosters[curRoster].emailList + inBetween + ';';
            inBetween = ' ';
          }
          if (item.ParentEMail !== ''){
            rosters[curRoster].emailList = rosters[curRoster].emailList + inBetween + item.ParentEMail;
            inBetween = ', ';
          }
		    }
  	  });
      curRoster++;
    } else {
      emptyCourses.push({title:''});
      if (myRoster.evt_lbl in myRoster.data){
        emptyCourses[curEmptyCourse].title = 'Empty Event: ' +  myRoster.eventID.toString() + ' (' + myRoster.data[myRoster.evt_lbl]['EVT_name'] + ') (' + myRoster.day + ' ' + myRoster.time + ')';
      }
      curEmptyCourse++;
    }
    myRsp.render(renderFile, {title: title, numRosters: curRoster, rosters: rosters, numEmptyCourses: curEmptyCourse, emptyCourses: emptyCourses});
  }
}
var getEventRoster = function getEventRoster(req, splitPath, query, passFunc, rsp, renderFile) {
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
  reportRoster.fetchData(Event_ID,renderRoster(rsp, reportRoster, renderFile));
}

var getRawRoster = function getRawRoster(req, splitPath, query, passFunc, rsp) {
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
  reportRoster.fetchData(Event_ID,passFunc);
}


var renderRosters = function renderRosters(myRsp, myMRoster, renderFile){
  return function (dat, err){
    var rosters = []; // Create array to store data for event students
    var curRoster = 0;
    var emptyCourses = [];
    var curEmptyCourse = 0;
    
//    if (data == []){
//      rspFunc(data,err); // no data in the requested regLbl so just return
//    } else {
//      if (err) {
//        passFunc(data,err);
//        util.sendResponse(myRsp, util.contType.TEXT, err );
//      } else {
//        myRsp.render('roster.njk', {title: title, studentData: studentData});
//      }
    var title = 'Multiple Event Rosters';
    for (ii = 0; ii < myMRoster.numRosters; ii++) {
      if (myMRoster.rosters[ii].numRegs > 0 ){
        rosters.push({evtID:'', evtName:'', studentData:[]});
        if (myMRoster.rosters[ii].evt_lbl in myMRoster.rosters[ii].data){
          rosters[curRoster].evtID      = myMRoster.rosters[ii].eventID.toString();
          rosters[curRoster].evtName    = myMRoster.rosters[ii].data[myMRoster.rosters[ii].evt_lbl]['EVT_name'];
        }
        myMRoster.rosters[ii].reduceData(rosters[curRoster].studentData);
        curRoster++;
      } else {
        emptyCourses.push({evtID:'', evtName:''});
        if (myMRoster.rosters[ii].evt_lbl in myMRoster.rosters[ii].data){
          emptyCourses[curEmptyCourse].evtID      = myMRoster.rosters[ii].eventID.toString();
          emptyCourses[curEmptyCourse].evtName    = myMRoster.rosters[ii].data[myMRoster.rosters[ii].evt_lbl]['EVT_name'];
        }
        curEmptyCourse++;
      }
    }
    myRsp.render(renderFile, {title: title, numRosters: curRoster, rosters: rosters, numEmptyCourses: curEmptyCourse, emptyCourses: emptyCourses});
  }
}

var getWeeklyRoster = function getWeeklyRoster(req, splitPath, query, passFunc, rsp, renderFile) {
  var mRosters = new eeutil.multiRosters(req, query);
  var timeDate = new Date();
  mRosters.fetchRosters(timeDate,timeDate,renderRosters(rsp, mRosters, renderFile));
}

var displayRawRosters = function renderRosters(myMRoster, passFunc){
  return function (dat, err){
	var newData = [];
    var title = 'Event_List';
    newData.push(myMRoster.data);

    for (ii = 0; ii < myMRoster.numRosters; ii++) {
      title = 'Roster_' + ii.toString();
      newData.push(myMRoster.rosters[ii].data);
    }
    passFunc(newData,myMRoster.err);
  }
}

var getRawWeeklyRoster = function getRawWeeklyRoster(req, splitPath, query, passFunc, rsp) {
  var mRosters = new eeutil.multiRosters(req, query);
  var timeDate = new Date();
  mRosters.fetchRosters(timeDate,timeDate,displayRawRosters(mRosters,passFunc));
}

var reportParse = function reportParse(req, splitPath, query, passFunc, rsp){

  switch (splitPath[2]) {
    case 'admin_roster':
      getEventRoster(req, splitPath, query, passFunc, rsp, 'admin_rosters.njk');
      break;
    case 'roster':
      getEventRoster(req, splitPath, query, passFunc, rsp, 'rosters.njk');
      break;
    case 'test_roster':
      getEventRoster(req, splitPath, query, passFunc, rsp, 'input_rosters.njk');
      break;
    case 'weekly_roster':
      getWeeklyRoster(req, splitPath, query, passFunc, rsp, 'admin_rosters.njk');
      break;
    case 'raw_roster':
      getRawRoster(req, splitPath, query, passFunc, rsp);
      break;
    case 'raw_weekly_roster':
      getRawWeeklyRoster(req, splitPath, query, passFunc, rsp);
      break;
    default:
      passFunc([],'reportParse Error: Unknown primary path: ' + splitPath[2] + ' from: ' + req.url);
      return;
  }
}
// *************************************************************************//
// sign in
// POST
var reportParsePost = function(req, splitPath, query, passFunc, rsp) {
  console.log(req.body.eventID)
  return rsp.redirect('/report/test_roster/'+req.body.eventID);
};

var reportCheckAuth = function reportCheckAuth(splitPath){
  const authPaths = [];

  if ( authPaths.indexOf(splitPath[2]) > -1 ) {
    return true;
  }
  return false;
}

exports.reportParse     = reportParse;
exports.reportParsePost = reportParsePost;
exports.reportCheckAuth = reportCheckAuth;
