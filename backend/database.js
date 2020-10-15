var Config = require("./config");
const { Client } = require('@elastic/elasticsearch');
var Promise = require('bluebird');
var moment = require('moment');
require("./extensions");

module.exports = Database = function() {
    this.hostAddress = "http://search_database:9200";
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

var tryConnection = async function(client, time) {
    if(time > maxConnectionAttemptTime) {
        throw new Error("Unable to connect to database");
    }

    try {
        await client.ping();
        await Promise.delay(3000); // Just to make sure indexes are up and ready
    }
    catch(error) {
        await Promise.delay(1500);
        await tryConnection(client, time + 1000);
    }
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
    createClient: function() {
        return new Client({
            node: this.hostAddress
        })
    },
    waitForConnection: async function() {
        var client = new Client({
            node: this.hostAddress,
            log: []
        });
        //return new Promise((resolve, reject) => reject());
        // return await client.ping({}, { requestTimeout: maxConnectionAttemptTime });
            // .catch(() => {
            //     new Error("Unable to connect to database");
            // });
        await tryConnection(client, 0);
    },
    createIfNeeded: async function() {
        var client = this.createClient();
        const { body: albumsIndexExists } = await client.indices.exists({ index: "albums" });
        const { body: tagsIndexExists } = await client.indices.exists({ index: "tags" });

        if(albumsIndexExists && tagsIndexExists)
            return "Index already exists, no need to create";

        let message = "";
        if(!albumsIndexExists){
            await client.indices.create(albumsIndexMappings);
            message += "Albums index does not exist, creating mappings. ";
        }
        if(!tagsIndexExists){
            await client.indices.create(tagsIndexMappings);
            message += "Tags index does not exist, creating mappings. ";
        }

        return message;
    },
    saveTag: function(tag) {
        return this
            .createClient()
            .index({
                index: "tags",
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
                index: "albums",
                body: albums.map(album => createUpsertOperation(album)).flatten()
            });
    },
    getUnsavedTags: function(tags) {
        var chunkedTags = tags.chunk(2);
        return Promise.reduce(chunkedTags, (total, chunk) => {
            return this
                .createClient()
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
                .then(results => {
                    var savedTags = results.body.hits.hits.map(x => x._id);
                    var unsavedTags = chunk.filter(tag => savedTags.indexOf(tag) == -1);
                    return total.concat(unsavedTags);
                });
        }, []);
    },
    getTagWithOldestUpdate: async function() {
        const results = await this
            .createClient()
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
        const results = await this
            .createClient()
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
        const { body } = await this
            .createClient()
            .count({
                index: "tags",
            })
        return body.count;
    },
    getAlbumCount: async function() {
        const { body } = await this
            .createClient()
            .count({
                index: "albums",
            });
        return body.count;
    }
}