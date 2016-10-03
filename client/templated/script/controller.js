var infoReference = {}
var env = new nunjucks.Environment(new nunjucks.WebLoader('/views'), { autoescape: true });

infoReference["registrants"] = "https://node.desertcommunityrobotics.com/events/5682/attendees";

function getURL(info){
    if(typeof infoReference[info] === "string"){
        console.log(infoReference[info]);
        return infoReference[info];
    } else {
        throw "no endpoint definition for that information type";
    }
}
