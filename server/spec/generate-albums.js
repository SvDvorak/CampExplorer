var Album = require("../source/api-types");

module.exports = function(count) {
	var albums = [];
	for(i = 0; i < count; i++)
    {
        albums.push(new Album(
        	"AlbumName" + i,
        	"AlbumArtist" + i,
        	"AlbumImage" + i,
        	"AlbumLink" + i,
        	"AlbumBandId" + i,
        	"AlbumId" + i));
    }

    return albums;
}