function hideLoader(){
    document.getElementById("loader").style.display = "none";
}

function insertInfo(info,template,parent,filter){
    var url;
    var re = /http:\/\//;
    try{
        url = getURL(info);
        var idx = addRequest(url+filter,render,true,{p:parent,t:template});
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
    var html = env.render(params.t,{results:data}); //results:data there must be a better way
    current.innerHTML = html;
    parent.appendChild(current);
    hideLoader();
}
