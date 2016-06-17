
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