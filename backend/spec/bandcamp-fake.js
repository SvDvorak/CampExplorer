var Promise = require("bluebird");

module.exports = BandcampFake = function(log) {
    this.albums = [];
    this.tags = [];
    this.tagsRequested = [];
    this.inProgress = [];
    this.delay = 0;
}

BandcampFake.prototype = {
    getAlbumsForTag: function (tag) {
        this.tagsRequested.push(tag);
        var albums = this.albums[tag] || [];

        return new Promise((resolve, reject) => {
            if(this.delay > 0) {
                setTimeout(function() {
                    resolve(albums);
                }, this.delay);
            }
            else {
                resolve(albums);
            }
        });
    },

    setAlbumsForTag: function (tag, tagAlbums) {
        this.albums[tag] = tagAlbums;
    },

    getTagsForAlbum: function (album) {
        var tags = this.tags[album.name] || [];
        return new Promise((resolve, reject) => {
            if(this.delay > 0) {
                setTimeout(function() { resolve(tags); }, this.delay)
            }
            else {
                resolve(tags);
            }
        });
    },

    setTagsForAlbum: function (album, tags) {
        this.tags[album.name] = tags;
    }
};