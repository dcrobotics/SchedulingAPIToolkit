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
    var data = querystring.stringify(authInfo);
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
    console.log("oauth_token = " + data["oauth_token"]);
    data = JSON.stringify(data);
    response = easyHeader(response);
    response.write(data);
    response.end();
}

function leg3(search, response, request){
    var passback = querystring.parse(search);
    var request_data = { //Options for oauth.authorize
        url: 'https://desertcommunityrobotics.com/oauth1/access',
        method: 'POST',
        data: {
            oauth_token: passback["oauth_token"],
            oauth_verifier: passback["oauth_verifier"],
            wp_scope: '*'
        }
    };
}

function easyHeader(response){
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    response.writeHead(200, {
        "Content-Type": "text/JSON"
    });
    return response;
}

exports.authorize = leg1;
exports.authcallback = leg3;
