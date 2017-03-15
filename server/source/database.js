var Promise = require("bluebird");
var Config = require("./config");
var request = require("request-promise");

var host = "http://tagsearch_database:9200/";

var putOptions = function(address, data) {
    return options =
    {
        method: "PUT",
        uri: host + address,
        headers: { "Content-Type": "application/json;charset=UTF-8" },
        json: data
    };
}

var getOptions = function(address, data) {
    return options =
    {
        method: "GET",
        uri: host + address,
    };
}

module.exports = Database = function() {
}

Database.prototype = {
    saveTag: function(tag) {
        request(putOptions("tagsearch/tags/" + tag, { }));
    },
    saveAlbums: function(albums) {
        //albums.map(album => request(putOptions("tagsearch/albums/" + album.id, album)));
    },
    getTagCount: function() {
        return Promise.resolve(request(getOptions("tagsearch/tags/_count", { })))
            .then(data => JSON.parse(data))
            .then(data => data.count);
    }
}