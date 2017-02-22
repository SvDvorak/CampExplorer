module.exports = Album = function(name, artist, image, link, bandId, albumId) {
  this.name = name;
  this.artist = artist;
  this.image = image;
  this.link = link;
  this.bandId = bandId;
  this.albumId = albumId;
}

Album.prototype.toString = function() {
  var ret =
      "Album\n" +
      "  " + this.name +
      "  " + this.artist +
      "  " + this.image + 
      "  " + this.link +
      "  " + this.bandId +
      "  " + this.albumId;

  return ret;
}