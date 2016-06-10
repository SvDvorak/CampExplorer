var Bandcamp = require("./server/bandcamp");
var fs = require("fs");

var bandcamp = new Bandcamp();
bandcamp.getAlbumsForTag("sweden", function(albums) {
	fs.writeFile("./albums-test.js", "module.exports = " + JSON.stringify(albums, null, 2) + ";", function(err) {
		    if(err) {
		        return console.log(err);
		    }

		    console.log("The file was saved!");
		});
});

bandcamp.getTagsForAlbum({ "bandId": 130700501, "albumId": 3087966927 }, function(tags) {
	console.log(tags);
});