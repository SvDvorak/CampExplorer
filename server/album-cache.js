
module.exports = Cache = function () {
    this.albums = { };
    this.inProgress = [];
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
    filterUncached: function(tags) {
        var albums = this.albums;
        return tags.filter(function(tag) { return !(tag in albums); });
    },
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