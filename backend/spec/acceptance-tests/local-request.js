var Config = require("./config");
var request = require('request-promise');

module.exports = function(tags) {
    var config = new Config();
    
    var options =
    {
        method: "POST",
        uri: "http://localhost:" + config.port + "/v1/albums",
        headers: { "Content-Type": "application/json;charset=UTF-8" },
        json: tags
    };

    // Cant use request promise, seems to be some issue when not converting to bluebird
    return Promise.resolve(request(options));
}