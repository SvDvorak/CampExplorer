var request = require("request");
var createOptions = require("./bandcamp-options");
var Album = require("../api-types");

module.exports = Bandcamp = function() {
}

var TagRequest = function(tag, callback) {
	this.albums = [];
	this.tag = tag;
	this.callback = callback;
	this.page = 0;
	this.maxIndex = 1;
}

Bandcamp.prototype = {
    getAlbumsForTag: function (tag, callback) {
    	this.getAlbumsForTagRecursive(new TagRequest(tag, callback));
    },

    getAlbumsForTagRecursive: function (tagRequest) {
    	var options = createOptions(tagRequest.tag, tagRequest.page);
		var api = this;

        request(options, function(error, response, data) {
			if(error) {
				return console.error("read failed on page " + data.args.p + " with error: " + error);
			}

			if(response.statusCode != 200)
			{
				console.log("not status 200");
				return;
			}

			tagRequest.albums = tagRequest.albums.concat(
				data.items.map(function(x) { return api.convertToAlbum(x); }));
			tagRequest.maxIndex = Math.ceil(data.total_count/48.0);
			tagRequest.page += 1;

			if(tagRequest.page > tagRequest.maxIndex)
			{
				tagRequest.callback(tagRequest.albums);
			}
			else
			{
				api.getAlbumsForTagRecursive(tagRequest);
			}
		});
    },

    convertToAlbum: function(bandcampAlbum) {
		var albumUrl = bandcampAlbum.url_hints;
		var album = new Album(
			bandcampAlbum.primary_text,
			bandcampAlbum.secondary_text,
			"https://f4.bcbits.com/img/a" + bandcampAlbum.art_id + "_11.jpg",
			"https://" + albumUrl.subdomain + ".bandcamp.com/album/" + albumUrl.slug);

		return album;
	}
};