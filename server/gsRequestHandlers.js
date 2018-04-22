const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const OAuth2Client = google.auth.OAuth2;
// const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly']; // Read Only
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];  // Read/Write
const TOKEN_PATH = 'credentials.json';

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback, req, splitPath, query, passFunc, rsp, renderFile) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new OAuth2Client(client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback, req, splitPath, query, passFunc, rsp, renderFile);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client, req, splitPath, query, passFunc, rsp, renderFile);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback, req, splitPath, query, passFunc, rsp, renderFile) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return callback(err, req, splitPath, query, passFunc, rsp, renderFile);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client, req, splitPath, query, passFunc, rsp, renderFile);
    });
  });
}

var getPrivatesSheet = function getPrivatesSheet(auth, req, splitPath, query, passFunc, rsp, renderFile) {
  const sheets = google.sheets({version: 'v4', auth});
  sheets.spreadsheets.values.get({
    spreadsheetId: '1kNHJrd6FQguCUtUvn_G5VhNrCsBfO3FtIvvFkn0hNA0',
    range: 'Form Responses 6!A1:Q',
  }, (err, {data}) => {
    if (err) {
       console.log('The API returned an error: ' + err);
       passFunc([],'gs Error: The API returned an error: ' + err + ' from: ' + req.url);
      return;
    }
    var inputValues = data.values;
    var outputValues = [];
    var studentName;
    var studentData = [];
    var dateSortOrder = [2,0,1]; // Year, Month, Day
    var columnRemapIdx = [6,4,2,10,1,9]; // Course Area, Course, Date, Duration, Instructor, Notes
    var curDate = new Date;
    
    var hoursTotal;
    var courseHoursSubtotal;
    var courseAreaHoursSubtotal;
    var curHours;
    var curCourse;
    var curCourseArea;
    var subtotalData = [];
    var studentNamesUpper = [];
    var studentNames = [];

    // Get the list of Student Names in the sheet
    if (inputValues.length) {
      // start at Row 1 to skip the headers
      for (var row = 1; row < inputValues.length; row++) {
        if (inputValues[row].length > 3) {
          if (studentNamesUpper.indexOf(inputValues[row][3].toUpperCase()) < 0) {
            studentNamesUpper.push(inputValues[row][3].toUpperCase());
            studentNames.push(inputValues[row][3]);
          }
        }
      }
      if (query === null){
        studentName = studentNames[0];
      } else {
        studentName = query;
        studentName = studentName.replace(/%20/g, " ");
      }

      // Get the information for the selected student
      for (var row = 1; row < inputValues.length; row++) {
        if (inputValues[row].length > 3) {
          if (studentName.toUpperCase() === inputValues[row][3].toUpperCase()) {
            studentData.push([]);
            for (var col = 0; col < columnRemapIdx.length; col++) {
              if (inputValues[row].length > columnRemapIdx[col]) {
                studentData[studentData.length-1].push(inputValues[row][columnRemapIdx[col]]);
              } else {
                studentData[studentData.length-1].push('No Input Data');
              } 
            }
          }          
        }
      }

      // Sort the array by Course Area, then by Course, then by Date
      // This sort order is needed to calculate the subtotals
      studentData.sort(function(a, b){
        var x = a[0].toUpperCase(); // sort by course area first
        var y = b[0].toUpperCase();
        if (x < y) {return -1;}
        if (x > y) {return 1;}
        x = a[1].toUpperCase(); // Next sort by course
        y = b[1].toUpperCase();
        if (x < y) {return -1;}
        if (x > y) {return 1;}
        var xdate = a[2].split('/'); // Finally sort by date
        var ydate = b[2].split('/');
        for (var ii = 0; ii < 3; ii++) {
          x = parseInt(xdate[dateSortOrder[ii]],10);
          y = parseInt(ydate[dateSortOrder[ii]],10);
          if (x < y) {return -1;}
          if (x > y) {return 1;}
        }
        return 0;
      });

      if (studentData.length) {
        // Generate subtotals and totals
        curHours = parseFloat(studentData[0][3]);
        if (isNaN(curHours)){ curHours = 0; } // Set the hours to 0 if they can't be determined
        hoursTotal = curHours;
        courseHoursSubtotal = curHours;
        courseAreaHoursSubtotal = curHours;
        curCourse = studentData[0][1];
        curCourseArea = studentData[0][0];
        for (var ii = 1; ii < studentData.length; ii++) {
          curHours = parseFloat(studentData[ii][3]);
          if (isNaN(curHours)){ curHours = 0; }
          hoursTotal += curHours;
          // look for change of curCourse or curCourseArea in case the same course is listed in multiple course areas
          if ((curCourse.toUpperCase() === studentData[ii][1].toUpperCase())  && (curCourseArea.toUpperCase() === studentData[ii][0].toUpperCase())) {
            courseHoursSubtotal += curHours;
            courseAreaHoursSubtotal += curHours;
          } else {
            if (curCourse == ''){curCourse = 'No Course';} // Set the course to No Course if it was left blank
            subtotalData.push(['', curCourse + ' Subtotal:', courseHoursSubtotal.toString(), '', '']) 
            courseHoursSubtotal = curHours;
            curCourse = studentData[ii][1];

            if (curCourseArea.toUpperCase() === studentData[ii][0].toUpperCase()) {
              courseAreaHoursSubtotal += curHours;
            } else {
              if (curCourseArea == ''){curCourseArea = 'No Course Area';}  // Set the course area to No Course Area if it was left blank
              subtotalData.push(['', '', '', curCourseArea + ' Subtotal:', courseAreaHoursSubtotal.toString()]) 
              courseAreaHoursSubtotal = curHours;
              curCourseArea = studentData[ii][0];
            }
          }

        }
        if (curCourse == ''){curCourse = 'No Course';}
        if (curCourseArea == ''){curCourseArea = 'No Course Area';}
        subtotalData.push(['', curCourse + ' Subtotal:', courseHoursSubtotal.toString(), '', '']) 
        subtotalData.push(['', '', '', curCourseArea + ' Subtotal:', courseAreaHoursSubtotal.toString()]) 
        subtotalData.push(['', '', '', 'Total Hours:', hoursTotal.toString()]);

        // Resort with most recent lessons first
        studentData.sort(function(a, b){
          var xdate = a[2].split('/');
          var ydate = b[2].split('/');
          for (var ii = 0; ii < 3; ii++) {
            x = parseInt(xdate[dateSortOrder[ii]],10);
            y = parseInt(ydate[dateSortOrder[ii]],10);
            if (x < y) {return 1;}
            if (x > y) {return -1;}
          }
          return 0;
        });
        
        // outputValues only used for writing to spread sheet
        outputValues.push(['Private student: ' + studentName]);
        outputValues.push(['']);
        outputValues.push(['Last updated: '+ curDate]);
        outputValues.push(['']);
        for (var ii = 0; ii < subtotalData.length; ii++) {
          outputValues.push(subtotalData[ii]);
        }
        outputValues.push(['']);
        outputValues.push(['Course Area', 'Course', 'Lesson Date', 'Duration in Hours', 'Instructor', 'Notes']);
        for (var row = 0; row < studentData.length; row++) {
          outputValues.push(studentData[row]);
        }

//        outputValues.map((outputRow) => {
//          console.log(`${outputRow}`);
//        });

        // write the results to the output spreadsheet
        var outputSheetID = '1xg3TIkPukvXL59iPh8x6AI-2DxUYC7mIITRTICM-TG4'
        var outputSheetDataRange = 'FormReport!A1:F';
        var outputInputOption = 'USER_ENTERED';
        var outputResource = {values: outputValues};
        var request = {
          spreadsheetId:    outputSheetID,
          range:            outputSheetDataRange,
          valueInputOption: outputInputOption,
          resource: outputResource,
          auth: auth,
        };


        var title = 'Private student: ' + studentName;

        // Render the webpage data
        rsp.render(renderFile, {title: title, studentNames: studentNames, subtotalData: subtotalData, studentData: studentData});

        // Update the output sheet
        sheets.spreadsheets.values.update(request, function(err, response) {
          if (err) {
            console.log('Error writing sheet: ' + err);
            return;
          }
        });

      } else {
        console.log('No user data found.');
        passFunc([],'gs Error: No user data found from: ' + req.url);
      }
    } else {
      console.log('No data found.');
      passFunc([],'gs Error: No data found from: ' + req.url);
    }
  });
}

var getPrivateStudentNotes = function getPrivateStudentNotes(req, splitPath, query, passFunc, rsp, renderFile){
  // Load client secrets from a local file.
  fs.readFile('client_secret.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    // Authorize the app with credentials, get the privates sheet via the Google Sheets API.
    authorize(JSON.parse(content), getPrivatesSheet, req, splitPath, query, passFunc, rsp, renderFile);
  });
}

var gsParse = function gsParse(req, splitPath, query, passFunc, rsp){

  switch (splitPath[2]) {
    case 'privates':
      getPrivateStudentNotes(req, splitPath, query, passFunc, rsp, 'privates.njk');
      break;
    default:
      passFunc([],'gsParse Error: Unknown primary path: ' + splitPath[2] + ' from: ' + req.url);
      return;
  }
}
// *************************************************************************//
// POST  Load the Private page of the requested student
var gsParsePost = function(req, splitPath, query, passFunc, rsp) {
  console.log(req.body.studentName)
  return rsp.redirect('/gs/privates/?'+req.body.studentName);
};

var gsCheckAuth = function gsCheckAuth(splitPath){
  const authPaths = [];

  if ( authPaths.indexOf(splitPath[2]) > -1 ) {
    return true;
  }
  return false;
}

exports.gsParse     = gsParse;
exports.gsParsePost = gsParsePost;
exports.gsCheckAuth = gsCheckAuth;
