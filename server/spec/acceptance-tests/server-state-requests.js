var Promise = require("bluebird");
var Config = require("./config");
var request = require('request-promise');

module.exports = {
    createRequest: function(endpoint) {
        var config = new Config();
        var options =
        {
            method: "GET",
            uri: "http://localhost:" + config.port + "/admin/" + endpoint
        };

        return Promise.resolve(request(options));
    },

    getCachedTags: function() {
        return this.createRequest("tagcount");
    },

    getQueuedTags: function() {
        return this.createRequest("tagsinqueue");
    }
}