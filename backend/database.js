var Config = require("./config");
var elasticsearch = require('elasticsearch');
var Promise = require('bluebird');
var moment = require('moment');
require("./extensions");

module.exports = Database = function() {
    this.hostAddress = "search_database:9200";
}

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

var maxConnectionAttemptTime = 60*1000;

var tryConnection = function(client, resolve, reject, time) {
    if(time > maxConnectionAttemptTime) {
        reject(new Error("Unable to connect to database"));
    }

    client.ping()
        .then(() => resolve())
        .catch(() => {
            Promise
                .delay(1000)
                .then(() => tryConnection(client, resolve, reject, time + 1000));
        });
};

var tagsearchMappings = {
    index: "tagsearch",
    body: {
        mappings : {
            albums : {
                properties : {
                    tags : { type: "keyword", index: "not_analyzed" }
                }
            },
            tags : {
                properties : {
                    lastUpdated : { type:"date", format: "basic_date_time_no_millis" }
                }
            }
        }
    }
}

Database.prototype = {
    createClient: function() {
        return new elasticsearch.Client({
            host: this.hostAddress
        })
    },
    waitForConnection: function() {
        var client = new elasticsearch.Client({
            host: this.hostAddress,
            log: []
        });
        return new Promise((resolve, reject) => tryConnection(client, resolve, reject, 0));
    },
    createIfNeeded: function() {
        var client = this.createClient();
        return client.indices.exists({
            index: "tagsearch"
        })
        .then(indexExists => { 
            if(!indexExists){
                return client.indices.create(tagsearchMappings)
                    .then(() => "Index does not exist, created index mappings");
            }
            
            return Promise.resolve("Index already exists, no need to create");
        });
    },
    saveTag: function(tag) {
        return this.createClient()
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

        return this.createClient()
            .bulk({
                index: "tagsearch",
                type: "albums",
                body: albums.map(album => createUpsertOperation(album)).flatten()
            });
    },
    getUnsavedTags: function(tags) {
        return this.createClient()
            .search({
                index: "tagsearch",
                type: "tags",
                size: tags.length,
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
        return this.createClient()
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
        .then(results => results.hits.hits.map(x => x._id)[0]);
    },
    getAlbumsByTags: function(count, tags) {
        var terms = tags.map(tag => {
            return { term: { tags: tag } }
        });
        return this.createClient()
            .search({
                index: "tagsearch",
                type: "albums",
                body: {
                    query: {
                        bool: {
                            must: terms
                        }
                    },
                    size: count
                }
            })
            .then(results => results.hits.hits.map(x => x._source));
    },
    getTagCount: function() {
        return this.createClient()
            .count({
                index: "tagsearch",
                type: "tags"
            })
            .then(data => data.count);
    },
    getAlbumCount: function() {
        return this.createClient()
            .count({
                index: "tagsearch",
                type: "albums"
            })
            .then(data => data.count);
    }
}