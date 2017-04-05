var Config = require("./config");
var elasticsearch = require('elasticsearch');
var Promise = require('bluebird');
var moment = require('moment');
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
                lang: "painless",
                inline: "if(!ctx._source.tags.contains(params.new_tag)) { ctx._source.tags.add(params.new_tag); }",
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
                body: {
                    lastUpdated: moment().format("YYYYMMDDTHHmmssZ")
                }
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
    getUnsavedTags: function(tags) {
        return createClient()
            .search({
                index: "tagsearch",
                type: "tags",
                body: {
                    query: {
                        terms: {
                            _id: tags
                        }
                    }
                }
            })
            .then(results => {
                var savedTags = results.hits.hits.map(x => x._id);
                return tags.filter(tag => savedTags.indexOf(tag) == -1)
            });
    },
    getTagWithOldestUpdate: function() {
        return createClient()
            .search({
                index: "tagsearch",
                type: "tags",
                body: {
                    query: { match_all: { } },
                    size: 1,
                    sort: [ {
                            lastUpdated: {
                                order: "asc"
                            }
                        }
                    ]
                }
            })
        .then(results => results.hits.hits.map(x => x._id));
    },
    getAlbumsByTags: function(tags) {
        var terms = tags.map(tag => {
            return { term: { tags: tag } }
        });
        return createClient()
            .search({
                index: "tagsearch",
                type: "albums",
                body: {
                    query: {
                        bool: {
                            must: terms
                        }
                    }
                }
            })
            .then(results => results.hits.hits.map(x => x._source));
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