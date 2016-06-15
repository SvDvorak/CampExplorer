
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

Array.prototype.BCflatten = function() {
    return []
        .concat
        .apply([], this);
};

Object.prototype.BCvalues = function() {
    var list = this;
    return Object.keys(list).map(function (key) {
        return list[key];
    });
}

Array.prototype.BCgroup = function(prop) {  
  var list = this;
  return list.reduce(function(grouped, item) {
      var key = item[prop];
      grouped[key] = grouped[key] || [];
      grouped[key].push(item);
      return grouped;
  }, {});
}