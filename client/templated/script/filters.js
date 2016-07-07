env.addFilter('dateformat', function(str) { //my babel fish has quite the headache today
    return new Date(str).toLocaleString();
});
