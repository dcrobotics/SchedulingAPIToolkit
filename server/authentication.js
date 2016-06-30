var querystring = require("querystring");
var OAuth = require("oauth-1.0a");
var https = require("https");
var nreq = require("./noderequester");

var oauth = OAuth({
    consumer: {
        public: 'bJJSUlPkEM7A',
        secret: '84qDaRvAzwpyHIyizlpA1r7bV1GtTKfmZs1UFcRUkmChuWkY'
    },
    signature_method: 'HMAC-SHA1'
});

function authorize(search, response, request){
    var request_data = { //Options for oauth.authorize
        url: 'https://desertcommunityrobotics.com/oauth1/request',
        method: 'POST',
        data: {
            oauth_callback: 'http://localhost:8888/authcallback'
        }
    };
    var authInfo = oauth.authorize(request_data); //Creates an object that store the requisite information we need to send to wordpress
    //Step 1 of http://oauthbible.com (three legged) comes from oath.authorize
    // console.log(authInfo);
    var data = querystring.stringify(authInfo); //THIS TOOK FOREVER TO FIGURE OUT turns out you need to send this info as a query string
    // console.log(data);
    var options = { //options required for the https request
        hostname: 'desertcommunityrobotics.com',
        port: 443,
        path: '/oauth1/request',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(data)
        }
    };

    var req = nreq.addRequest(options,authReturn, true, response);
    nreq.writeRequest(req, data);

}
function authReturn(data, response){

}

function authcallback(search, response, request){

}



exports.authorize = authorize;
exports.authcallback = authcallback;
