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

function leg1(search, response, request){
    var request_data = { //Options for oauth.authorize
        url: 'https://desertcommunityrobotics.com/oauth1/request',
        method: 'POST',
        data: {
            oauth_callback: 'http://localhost:8888/authcallback'
        }
    };
    var authInfo = oauth.authorize(request_data); //Creates an object that store the requisite information we need to send to wordpress
    //Step 1 of http://oauthbible.com (three legged) comes from oath.authorize
    var data = querystring.stringify(authInfo); //THIS TOOK FOREVER TO FIGURE OUT turns out you need to send this info as a query string
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

    var rid = nreq.addRequest(options, leg2, response);
    console.log("try writing " + rid);
    nreq.writeRequest(rid, data);
    console.log("try ending " + rid);
    nreq.endRequest(rid);

}
function leg2(data, response){
    data=querystring.parse(data);
    data = JSON.stringify(data);
    console.log("authReturn: "+data);
    response.write(data);
    response.end();
}

function authcallback(search, response, request){

}



exports.authorize = leg1;
exports.authcallback = authcallback;
