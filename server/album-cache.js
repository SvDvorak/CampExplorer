
module.exports = Cache = function (albumApi) {
    this.albumApi = albumApi;
};

Cache.prototype = {
    getAlbumsByTags: function (tags) {
        var api = this.albumApi;
        var filteredTagAlbums = tags
            .map(function(x) { return api.getAlbumsForTag(x); });

        var flattenedAlbums = []
            .concat
            .apply([], filteredTagAlbums);

        var groupedAlbums = group(flattenedAlbums, "link");

        var keys = Object.keys(groupedAlbums);
        var foundAlbums = keys.map(function(x) { return groupedAlbums[x]; })
            .filter(function(x) { return x.length == tags.length; })
            .map(function(x) { return x[0] });

        return foundAlbums;
    },
};

function group(list, prop) {  
  return list.reduce(function(grouped, item) {
      var key = item[prop];
      grouped[key] = grouped[key] || [];
      grouped[key].push(item);
      return grouped;
  }, {});
}