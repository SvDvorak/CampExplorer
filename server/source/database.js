var Promise = require("bluebird");
var Config = require("./config");
var request = require("request-promise");
var elasticsearch = require('elasticsearch');
var Promise = require('bluebird');

var hostAddress = "tagsearch_database:9200";
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

var postOptions = function(data) {
    return options =
    {
        method: "POST",
        uri: host + "tagsearch/albums/_bulk",
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

var indexOperation = function(id) { 
    return { index : { _index: "tagsearch", _type: "albums", _id : id } };
}

module.exports = Database = function() {
}

var createClient = function() {
    return new elasticsearch.Client({
        host: hostAddress
    })
};

var flatten = function(arrayOfArrays) {
    return [].concat.apply([], arrayOfArrays);
}

Database.prototype = {
    saveTag: function(tag) {
        return createClient()
            .index({
                index: "tagsearch",
                type: "tags",
                id: tag,
                body: { }
            });
    },
    saveAlbums: function(albums) {
        if(albums.length == 0) {
            return Promise.resolve();
        }

        return createClient()
            .bulk({ body: flatten(albums.map(album => [ indexOperation(album.id), album ])) });
    },
    getTagCount: function() {
        return createClient()
            .count({
                index: "tagsearch",
                type: "tags"
            })
            .then(data => data.count);
    },
    getAlbumCount: function() {
        return createClient()
            .count({
                index: "tagsearch",
                type: "albums"
            })
            .then(data => data.count);
    }
}