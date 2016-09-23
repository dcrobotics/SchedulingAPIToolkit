var events = [];
var rosters = [];
//********Get events in date range********

//https://node.desertcommunityrobotics.com/ee/events?include=EVT_name&where[Datetime.DTT_ID]=98
//This does not work
//https://node.desertcommunityrobotics.com/ee/events?include=EVT_name,EVD_desc&where[Datetime.DTT_EVT_start]=%2016-04-30%
//But this does?
//https://node.desertcommunityrobotics.com/ee/events?include=EVT_name,EVD_desc&filter[where][Datetime.DTT_EVT_start]=%2016-04-30%
//except how do I get range of dates?
//Also what's with the %%? Are they regular expressions?

addRequest(getEventsURL, quickrender, false, {});

//Get registrants in each event and ball up into roster object


//Get tickets with correct datetime


//Filter registrants by ticket datetime


//Attach form info to each registrant object


//
function quickrender(data, params){

}
