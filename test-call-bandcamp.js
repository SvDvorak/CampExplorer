var request = require("request");
var fs = require('fs');

var albums = [];
var maxIndex = 1;

var options =
{
	method: "POST",
	uri: "https://bandcamp.com/api/discover/2/get",
	headers: { "Content-Type": "application/json;charset=UTF-8" },
	json: {
    	"s": "top",
		"p": 0,
		"t": "portugal"
	}
};

function requestAlbumsPage(options)
{
	console.log("request sent");
	request(options, function(error, response, data) {
		console.log("request returned");
		if(error) {
			return console.error("read failed on page " + data.args.p + " with error: " + error);
		}

		if(response.statusCode != 200)
		{
			console.log("not status 200");
			return;
		}

		console.log("Call for page " + data.args.p);

		var newAlbums = data.items.map(function(x)
		{
			var albumUrl = x.url_hints;
			var album =
				{
					name: x.primary_text,
					artist: x.secondary_text,
					image: "https://f4.bcbits.com/img/a" + x.art_id + "_11.jpg",
					link: "https://" + albumUrl.subdomain + ".bandcamp.com/album/" + albumUrl.slug
				};

			return album;
		});

		albums = albums.concat(newAlbums);
		maxIndex = Math.ceil(data.total_count/48.0);

		options.json.p += 1;

		if(options.json.p > maxIndex)
		{
			fs.writeFile("./spec/albums-portugal.js", "module.exports = " + JSON.stringify(albums, null, 2) + ";", function(err) {
			    if(err) {
			        return console.log(err);
			    }

			    console.log("The file was saved!");
			});
		}
		else
		{
			requestAlbumsPage(options);
		}
	});
}

requestAlbumsPage(options);