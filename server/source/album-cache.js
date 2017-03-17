require("./extensions");

module.exports = Cache = function () {
    this.albums = { };
};

Cache.prototype = {
    getAlbumsByTags: function (tags) {
        var api = this.albumApi;
        var albums = this.albums;

        return tags
          .map(tag => albums[tag] || [])
          .flatten()
          .BCgroup("link")
          .BCvalues()
          .filter(x => x.length == tags.length)
          .map(x => x[0]);
    },
    
    filterUncached: function(tags) {
        var albums = this.albums;
        return tags.filter(tag => !(tag in albums));
    },
};