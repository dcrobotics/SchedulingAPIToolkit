function foo(){
    this.boo = function(){
        console.log("boo");
    }
    console.log("bar");
    this.boo();
}