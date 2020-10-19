const Config = require("./config");

Array.prototype.flatten = function() {
    return []
        .concat
        .apply([], this);
};

Array.prototype.BCgroup = function(prop) {  
  var list = this;
  return list.reduce(function(grouped, item) {
      var key = item[prop];
      grouped[key] = grouped[key] || [];
      grouped[key].push(item);
      return grouped;
  }, {});
}

Array.prototype.chunk = function(size) {
    var list = this.slice();
    var arrays = [];

    while (list.length > 0) {
        arrays.push(list.splice(0, size));
    }

    return arrays;
}

var config = new Config();

module.exports = {
    BCtags: function(list) {
        return Object.keys(list).map(function (key) {
            return list[key];
        })
    },
    timeout: function(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },
    debugLog: function(logFunc, message) {
        if(config.isDebug) {
            logFunc("DEBUG: " + message);
        }
    }
}