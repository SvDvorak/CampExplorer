
module.exports = BandcampFake = function() {
    this.albums = [];
}

BandcampFake.prototype = {
    getAlbumsForTag: function (tag) {
        if(tag in this.albums)
        {
            return this.albums[tag];
        }
        else
        {
            return [];
        }
    },

    setAlbumsForTag: function (tag, tagAlbums) {
        this.albums[tag] = tagAlbums;
    }
};