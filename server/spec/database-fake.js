var Promise = require("bluebird");
require("../source/extensions");

module.exports = DatabaseFake = function() {
    this.savedTags = [];
    this.saveAlbumsCalls = [];
}

DatabaseFake.prototype = {
    getTags: function() {
        return this.savedTags;
    },
    getTagCount: function() {
        if(this.savedTags.length == 0)
        {
            return Promise.reject("No tags exception");
        }
        return Promise.resolve(this.savedTags.length);
    },
    getAlbumCount: function() {
        if(this.savedTags.length == 0)
        {
            return Promise.reject("No tags exception");
        }
        return Promise.resolve(this.saveAlbumsCalls.map(calls => calls.albums).flatten().length);
    },
    saveTag: function(tag) {
        this.savedTags.push(tag);
    },
    saveAlbums: function(tag, albums) {
        this.saveAlbumsCalls.push({ tag: tag, albums: albums });
    }
};