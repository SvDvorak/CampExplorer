var Promise = require("bluebird");
require("../extensions");

module.exports = DatabaseFake = function() {
    this.savedTags = [];
    this.getAlbumsCalls = [];
    this.saveAlbumsCalls = [];
    this.connectionPromise = Promise.resolve();
}

DatabaseFake.prototype = {
    waitForConnection: function() {
        return this.connectionPromise;
    },
    createIfNeeded: function() {
        this.created = true;
    },
    saveTag: function(tag) {
        this.savedTags.push(tag);
        return Promise.resolve();
    },
    saveAlbums: function(tag, albums) {
        this.saveAlbumsCalls.push({ tag: tag, albums: albums });
        return Promise.resolve();
    },
    getUnsavedTags: function(tags) {
        savedTags = this.savedTags;
        return Promise.resolve(tags.filter(tag => savedTags.indexOf(tag) == -1));
    },
    getTagWithOldestUpdate: function() {
        if(this.savedTags.length == 0) {
            return Promise.reject("No tags in database");
        }
        return Promise.resolve(this.savedTags[0]);
    },
    getAlbumsByTags: function(count, tags) {
        this.getAlbumsCalls.push({ tags: tags });
        databaseFake = this;
        return Promise.resolve(tags
          .map(tag => databaseFake.getAlbumsByTag(tag) || [])
          .flatten()
          .BCgroup("link")
          .BCvalues()
          .filter(x => x.length == tags.length)
          .map(x => x[0])
          .slice(0, count));
    },
    getAlbumsByTag: function(tag) {
        var filtered = this.saveAlbumsCalls.filter(call => call.tag == tag)[0].albums;
        return filtered;
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
};