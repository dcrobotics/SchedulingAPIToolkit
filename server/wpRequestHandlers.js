var WP = require('wpapi');
var server = require('./server.js');

function root(splitPath, query, response, request){
  response = easyHeader(response);
  response.write('Welcome to DCR\'s node server' );
  response.end();
}
// Get a list of pages on the server
function pages(splitPath, query, response, request){
  server.wpEp.pages().get(function(err,data){
    if ( err ) {
      console.log(err);
    } else {
//      console.log(data);
      response = easyHeader(response);
      response.write(JSON.stringify(data));
      response.end();
    }
  });
}

// Useful functions
// ToDo create a lib file 
function easyHeader(response){
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  response.writeHead(200, {
    'Content-Type': 'text/JSON'
  });
  return response;
}

exports.root = root;
exports.pages = pages;
