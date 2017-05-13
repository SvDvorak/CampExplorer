var Album = require("../api-types");

module.exports = function(count) {
	var albums = [];
	for(i = 0; i < count; i++)
    {
        albums.push(new Album(
			"AlbumId" + i,
			"AlbumName" + i,
        	"AlbumArtist" + i,
        	"AlbumImage" + i,
        	"AlbumLink" + i,
        	"AlbumBandId" + i
        	));
    }

    return albums;
}