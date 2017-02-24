
module.exports = BandcampFake = function() {
    this.albums = [];
    this.tags = [];
    this.tagsRequested = [];
    this.inProgress = [];
    this.delay = 0;
}

BandcampFake.prototype = {
    getAlbumsForTag: function (tag, callback) {
        this.tagsRequested.push(tag);
        var albums = this.albums[tag] || [];
        if(this.delay > 0) {
            setTimeout(function() {
                callback(albums);
            }, this.delay);
        }
        else {
            callback(albums);
        }
    },

    setAlbumsForTag: function (tag, tagAlbums) {
        this.albums[tag] = tagAlbums;
    },

    getTagsForAlbum: function (album, callback) {
        var tags = this.tags[album.name] || [];
        if(this.delay > 0) {
            setTimeout(function() { callback(tags); }, this.delay)
        }
        else {
            callback(tags);
        }
    },

    setTagsForAlbum: function (album, tags) {
        this.tags[album.name] = tags;
    }
};