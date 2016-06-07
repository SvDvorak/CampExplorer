module.exports = Album = function(name, artist, image, link) {
  this.name = name;
  this.artist = artist;
  this.image = image;
  this.link = link;
}

Album.prototype.toString = function() {
  var ret =
      "Album\n" +
      "  " + this.name +
      "  " + this.artist +
      "  " + this.image + 
      "  " + this.link;
  return ret;
}