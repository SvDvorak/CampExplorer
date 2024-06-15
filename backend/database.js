var Config = require("./config");
const { Client } = require('@elastic/elasticsearch');
var moment = require('moment');
require("./extensions");
const { timeout } = require("./extensions");

module.exports = Database = function() {
    this.hostAddress = "http://search_database:9200";
    this.client = new Client({
        node: this.hostAddress
    });
}

var createUpsertOperation = function(album) {
    return [
        { update : { _id : album.id } },
        { 
            script: {
                lang: "painless",
                source: "if(!ctx._source.tags.contains(params.new_tag)) { ctx._source.tags.add(params.new_tag); }",
                params: {
                    new_tag: album.tags[0]
                }
            },
            upsert: album
        }
    ]
};

var maxConnectionAttemptTime = 60*1000;

var tryConnection = async function(client) {
    var time = 0;
    var success = false;
    while(!success && time < maxConnectionAttemptTime) {
        try {
            await client.ping();
            await timeout(3000); // Just to make sure indexes are up and ready
            success = true;
        }
        catch(error) {
            await timeout(1500);
            time += 1000;
        }
    }

    if(!success)
        throw new Error("Unable to connect to database");
};

// var tagsearchMappings = {
//     index: "tagsearch",
//     body: {
//         mappings : {
//             albums : {
//                 properties : {
//                     tags : { type: "keyword", index: "not_analyzed" }
//                 }
//             },
//             tags : {
//                 properties : {
//                     lastUpdated : { type:"date", format: "basic_date_time_no_millis" }
//                 }
//             }
//         }
//     }
// }

var albumsIndexMappings = {
    index: "albums",
    body: {
        mappings : {
            properties : {
                tags : { type: "keyword", index: true }
            }
        }
    }
}

var tagsIndexMappings = {
    index: "tags",
    body: {
        mappings : {
            properties : {
                lastUpdated : { type: "date", format: "basic_date_time_no_millis" }
            }
        }
    }
}

Database.prototype = {
    waitForConnection: async function() {
        var client = new Client({
            node: this.hostAddress,
            log: []
        });
        await tryConnection(client);
    },
    createIfNeeded: async function() {
        const { body: albumsIndexExists } = await this.client.indices.exists({ index: "albums" });
        const { body: tagsIndexExists } = await this.client.indices.exists({ index: "tags" });

        if(albumsIndexExists && tagsIndexExists)
            return "Index already exists, no need to create";

        let message = "";
        if(!albumsIndexExists){
            await this.client.indices.create(albumsIndexMappings);
            message += "Albums index does not exist, creating mappings. ";
        }
        if(!tagsIndexExists){
            await this.client.indices.create(tagsIndexMappings);
            message += "Tags index does not exist, creating mappings. ";
        }

        return message;
    },
    saveTag: async function(tag) {
        await this.client
            .index({
                index: "tags",
                id: tag,
                body: {
                    lastUpdated: moment().format("YYYYMMDDTHHmmssZ")
                }
            });
    },
    saveAlbums: async function(tag, albums) {
        if(albums.length == 0) {
            return;
        }

        albums.forEach(album => { album.tags = [ tag ]});

        await this.client
            .bulk({
                index: "albums",
                body: albums.map(album => createUpsertOperation(album)).flatten()
            });
    },
    getUnsavedTags: async function(tags) {
        var chunkedTags = tags.chunk(2);
        var total = [];
        for(const chunk of chunkedTags) {
            const results = await this.client
                .search({
                    index: "tags",
                    size: chunk.length,
                    body: {
                        query: {
                            terms: {
                                _id: chunk
                            }
                        }
                    }
                })
            var savedTags = results.body.hits.hits.map(x => x._id);
            var unsavedTags = chunk.filter(tag => savedTags.indexOf(tag) == -1);
            total = total.concat(unsavedTags);
        }

        return total;
    },
    getTagWithOldestUpdate: async function() {
        const results = await this.client
            .search({
                index: "tags",
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
            });
        return results.body.hits.hits.map(x => x._id)[0]
    },
    getAlbumsByTags: async function(count, tags) {
        var terms = tags.map(tag => {
            return { term: { tags: tag } }
        });
        const results = await this.client
            .search({
                index: "albums",
                body: {
                    query: {
                        bool: {
                            must: terms
                        }
                    },
                    size: count
                }
            });
        return results.body.hits.hits.map(x => x._source);
    },
    getTagCount: async function() {
        const { body } = await this.client
            .count({
                index: "tags",
            })
        return body.count;
    },
    getAlbumCount: async function() {
        const { body } = await this.client
            .count({
                index: "albums",
            });
        return body.count;
    }
}