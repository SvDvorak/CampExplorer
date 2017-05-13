var express = require("express");
var path = require("path");
var app = express();

var port = 3030;

//app.use('/static', express.static(path.join(__dirname, 'public')));
app.use(express.static('public'));

app.listen(port, function() {
    console.log("Example app listening on port " + port);
});