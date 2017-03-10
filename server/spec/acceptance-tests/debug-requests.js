var Promise = require("bluebird");
var Config = require("./config");
var request = require('request-promise');

module.exports = function() {
    var config = new Config();
    
    var options =
    {
        method: "GET",
        uri: "http://localhost:" + config.port + "/admin/tagcount"
    };

    return Promise.resolve(request(options));
}