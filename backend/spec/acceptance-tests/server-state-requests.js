var Config = require("./config");
var request = require('request-promise');

module.exports = {
    createRequest: function(method, endpoint, json) {
        var config = new Config();
        var options =
        {
            method: method,
            uri: "http://localhost:" + config.port + "/admin/" + endpoint,
            json: json
        };

        return Promise
            .resolve(request(options))
            .then(data => JSON.parse(data));
    },

    getCachedTags: function() {
        return this.createRequest("GET", "tagcount");
    },

    getQueuedOperations: function() {
        return this.createRequest("GET", "operationsinqueue");
    },

    getCurrentlyCaching: function() {
        return this.createRequest("GET", "currentlycaching");
    },

    getAlbumCount: function() {
        return this.createRequest("GET", "albumcount");
    },

    getAlbumCountWithoutUpdatedTags: function() {
        return this.createRequest("GET", "albumsWithoutUpdatedTags");
    },

    getRequestRate: function(numberOfHours) {
        return this.createRequest("POST", "requestrate", { sinceInHours: numberOfHours });
    }
}