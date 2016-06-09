
module.exports = BandcampFake = function() {
    this.albums = [];
    this.tagsRequested = [];
    this.inProgress = [];
    this.delay = 0;
}

BandcampFake.prototype = {
    getAlbumsForTag: function (tag, callback) {
        this.tagsRequested.push(tag);
        this.inProgress.push(tag);
        var api = this;

        var albums = this.albums[tag] || [];
        if(this.delay > 0) {
            setTimeout(function() {
                callback(albums);
                api.removeInProgress(tag);
            }, this.delay);
        }
        else {
            callback(albums);
        }
    },

    setAlbumsForTag: function (tag, tagAlbums) {
        this.albums[tag] = tagAlbums;
    },

    removeInProgress: function(tag) {
        var i = this.inProgress.indexOf(tag);
        if(i != -1) {
            this.inProgress.splice(i, 1);
        }
    }
};