module.exports = Album = function(id, name, artist, image, link, bandId) {
  this.id = id;
  this.name = name;
  this.artist = artist;
  this.image = image;
  this.link = link;
  this.bandId = bandId;
}

Album.prototype.toString = function() {
  var ret =
      "Album\n" +
      "  " + this.id +
      "  " + this.name +
      "  " + this.artist +
      "  " + this.image + 
      "  " + this.link +
      "  " + this.bandId;

  return ret;
}