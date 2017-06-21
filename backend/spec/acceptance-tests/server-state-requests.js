var Promise = require("bluebird");
var Config = require("./config");
var request = require('request-promise');

module.exports = {
    createRequest: function(endpoint, json) {
        var config = new Config();
        var options =
        {
            method: "GET",
            uri: "http://localhost:" + config.port + "/admin/" + endpoint,
            json: json
        };

        return Promise.resolve(request(options)).then(data => JSON.parse(data));
    },

    getCachedTags: function() {
        return this.createRequest("tagcount");
    },

    getQueuedTags: function() {
        return this.createRequest("tagsinqueue");
    },

    getCurrentlyCachingTag: function() {
        return this.createRequest("currentlycachingtag");
    },

    getAlbumCount: function() {
        return this.createRequest("albumcount");
    },

    getRequestRate: function(numberOfHours) {
        return this.createRequest("requestrate", { sinceInHours: numberOfHours });
    }
}