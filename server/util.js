var contType = {
  TEXT : 0,
  HTML : 1,
  JSON : 2
}

function setHeader(response, type){
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  switch (type){
    case contType.TEXT:
      response.writeHead(200, { 'Content-Type': 'text/plain' });
      break;
    case contType.HTML:
      response.writeHead(200, { 'Content-Type': 'text/html' });
      break;
    case contType.JSON:
      response.writeHead(200, { 'Content-Type': 'application/json' });
      break;
    default:
      console.log('warning unknown content type:' + type);
      response.writeHead(200, {'Content-Type': 'text/plain' });
      break;
  }
  return response;
}

exports.setHeader = setHeader;
exports.contType  = contType;
