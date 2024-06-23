var Promise = require("bluebird");
const { BCtags } = require("../extensions");

module.exports = DatabaseFake = function() {
    this.savedTags = [];
    this.getAlbumsCalls = [];
    this.saveTagAlbumsCalls = [];
    this.saveAlbumCalls = [];
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
    saveTags: function(tags) {
        this.savedTags = this.savedTags.concat(tags);
        return Promise.resolve();
    },
    saveTagAlbums: function(tag, albums) {
        this.saveTagAlbumsCalls.push({ tag: tag, albums: albums });
        return Promise.resolve();
    },
    saveAlbum: function(album, tags) {
        this.saveAlbumCalls.push({ album: album, tags: tags });
        return Promise.resolve();
    },
    getUnsavedTags: function(tags) {
        savedTags = this.savedTags;
        return Promise.resolve(tags.filter(tag => savedTags.indexOf(tag) == -1).map(x => x));
    },
    getTagWithOldestUpdate: function() {
        return Promise.resolve(this.savedTags[0]);
    },
    getAlbumsByTags: function(count, tags) {
        this.getAlbumsCalls.push({ tags: tags });
        var included = this.getAllByTags(tags.filter(x => x.operation == "include"));
        var excluded = this.getAllByTags(tags.filter(x => x.operation == "exclude"));

        return Promise.resolve(
            included.filter(x => !excluded.some(y => x.link === y.link))
            .slice(0, count));
    },
    getAllByTags: function(tags) {
        databaseFake = this;
        return BCtags(tags
            .map(tag => databaseFake.getAlbumsByTag(tag) || [])
            .flatten()
            .BCgroup("link"))
            .filter(x => x.length == tags.length)
            .map(x => x[0]);
    },
    getAlbumsByTag: function(tag) {
        var filtered = this.saveTagAlbumsCalls.filter(call => call.tag == tag.name);

        if(filtered.length > 0)
            return filtered[0].albums;
        return [];
    },
    getAlbumWithoutUpdatedTags: function() {
        return Promise.resolve(this.saveTagAlbumsCalls[0].albums[0]);
    },
    getTagCount: function() {
        return Promise.resolve(this.savedTags.length);
    },
    getAlbumCount: function() {
        return Promise.resolve(this.saveTagAlbumsCalls.map(calls => calls.albums).flatten().length);
    },
    getAlbumCountWithoutUpdatedTags: async function() {
        return Promise.resolve(this.saveTagAlbumsCalls
            .map(calls => calls.albums)
            .flatten()
            .filter(x => !x.hasTagsBeenUpdated).length);
    }
};