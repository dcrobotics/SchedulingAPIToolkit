env.addFilter('dateformat', function(str) {
    var dt = new Date(str)
    return dt.toLocaleString();
});
