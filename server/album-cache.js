
module.exports = Cache = function (albumApi) {
    this.albumApi = albumApi;
    this.albums = { };
};

Cache.prototype = {
    getAlbumsByTags: function (tags) {
        var api = this.albumApi;
        var albums = this.albums;

        var flattenedAlbums = flatten(tags.map(function(tag) { return albums[tag] || [] }));

        return values(
                group(
                    flattenedAlbums,
                    "link"))
            .filter(function(x) { return x.length == tags.length; })
            .map(function(x) { return x[0] });
    },
    hasCached: function(tags) {
        var api = this.albumApi;
        var albums = this.albums;
        return tags.every(function(tag) { return tag in albums; });
    },
    updateTags: function(tags) {
        var api = this.albumApi;
        var albums = this.albums;
        tags
            .filter(function(tag) { return !(tag in albums || api.inProgress.indexOf(tag) != -1); })
            .forEach(function(tag) {
                api.getAlbumsForTag(tag, function(newAlbums) {
                    albums[tag] = newAlbums
                });
        });
    }
};

function flatten(list) {
    return []
        .concat
        .apply([], list);
}

function values(list) {
    return Object.keys(list).map(function (key) {
        return list[key];
    });
}

function group(list, prop) {  
  return list.reduce(function(grouped, item) {
      var key = item[prop];
      grouped[key] = grouped[key] || [];
      grouped[key].push(item);
      return grouped;
  }, {});
}