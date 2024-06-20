
module.exports = TagCriteria = function(operation, name) {
    this.operation = operation;
    this.name = name;
}

TagCriteria.prototype.toString = function() {
  return "TagCriteria\n" +
      "  " + this.operation +
      "  " + this.name;
}