require("./extensions");

module.exports = Cache = function () {
    this.albums = { };
};

Cache.prototype = {
    getAlbumsByTags: function (tags) {
        var api = this.albumApi;
        var albums = this.albums;

        return tags
          .map(function(tag) { return albums[tag] || [] })
          .BCflatten()
          .BCgroup("link")
          .BCvalues()
          .filter(function(x) { return x.length == tags.length; })
          .map(function(x) { return x[0] });
    },
    
    filterUncached: function(tags) {
        var albums = this.albums;
        return tags.filter(function(tag) { return !(tag in albums); });
    },
};