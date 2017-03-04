var request = require("request");
var Config = require("./config");
var request = require('request-promise');

module.exports = function(tags, onResponse, onFailure) {
    var config = new Config();
    
    var options =
    {
        method: "POST",
        uri: "http://localhost:" + config.port + "/v1/albums",
        headers: { "Content-Type": "application/json;charset=UTF-8" },
        json: tags
    };

    return request(options);
}