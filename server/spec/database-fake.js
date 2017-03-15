var Promise = require("bluebird");

module.exports = DatabaseFake = function() {
    this.savedTags = [];
    this.savedAlbums = [];
    this.calledSaveAlbums = false;
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
    saveTag: function(tag) {
        this.savedTags.push(tag);
    },
    saveAlbums: function(albums) {
        this.calledSaveAlbums = true;
        this.savedAlbums = this.savedAlbums.concat(albums);
    }
};