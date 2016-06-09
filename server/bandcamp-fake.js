
module.exports = BandcampFake = function() {
    this.albums = [];
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
};