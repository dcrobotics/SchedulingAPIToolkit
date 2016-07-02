
function hideLoader(){
    document.getElementById("loader").style.display = "none";
}

function insertInfo(info,template,parent,filter){
    var url;
    try{
        url = getURL(info);
        var idx = addRequest(url,render,true,{p:parent,t:template});
        dispatch(idx);
    } catch (error) {
        window.alert(error);
    }
}

function render(data, params){
    console.log("render!");
    console.log(data);
    var parent = document.getElementById(params["p"]);
    var current = document.createElement("div");
    var html = nunjucks.render(params.t,{results:data}); //this needs to be fixed
    current.innerHTML = html;
    parent.appendChild(current);
    hideLoader();
}
