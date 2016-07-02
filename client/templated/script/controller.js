var infoReference = {}

infoReference["events"] = "https://node.desertcommunityrobotics.com/newevents";

function getURL(info){
    if(typeof infoReference[info] === "string"){
        console.log(infoReference[info]);
        return infoReference[info];
    } else {
        throw "no endpoint definition for that information type";
    }
}
