var Promise = require("bluebird");
var Config = require("./config");
var request = require("request-promise");
var elasticsearch = require('elasticsearch');
var Promise = require('bluebird');
require("./extensions");

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

module.exports = Database = function() {
}

var createClient = function() {
    return new elasticsearch.Client({
        host: hostAddress
    })
};

var createUpsertOperation = function(album) {
    return [
        { update : { _id : album.id } },
        { 
            script: {
                lang: "groovy",
                file: "update_tags",
                params: {
                    new_tag: album.tags[0]
                }
            },
            upsert: album
        }
    ]
};

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
    saveAlbums: function(tag, albums) {
        if(albums.length == 0) {
            return Promise.resolve();
        }

        albums.forEach(album => { album.tags = [ tag ]});

        return createClient()
            .bulk({
                index: "tagsearch",
                type: "albums",
                body: albums.map(album => createUpsertOperation(album)).flatten()
            })
            .catch(error => { console.log("Save albums errors: "); console.log(error); });
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