
var albums = {}

module.exports = {
    getAlbumsByTag: function () {
        return albums;
    },

    setAlbumsForTag: function (tag, newAlbums) {
        albums = newAlbums;
    }
};
