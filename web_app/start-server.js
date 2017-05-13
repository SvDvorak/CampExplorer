var express = require('express');
var path = require('path');
var app = express();

var port = 3001;

app.use(express.static(path.join(__dirname, 'web_app')));
app.use('/statistics', express.static(path.join(__dirname, 'web_statistics')));

app.listen(port, function() {
    console.log("Listening for HTTP requests on port " + port + ". Check Docker Compose if mapped to different port.");
});