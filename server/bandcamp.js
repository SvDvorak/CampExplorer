var request = require("request");
var options = require("./bandcamp-options");
var Album = require("../api-types");

module.exports = Bandcamp = function() {
}

var AlbumsRequest = function(tag, successCallback, errorCallback) {
	this.albums = [];
	this.tag = tag;
	this.successCallback = successCallback;
	this.errorCallback = errorCallback;
	this.page = 0;
	this.maxIndex = 1;
	this.errorCount = 0;
}

Bandcamp.prototype = {
    getAlbumsForTag: function (tag, successCallback, errorCallback) {
    	this.getAlbumsForTagRecursive(new AlbumsRequest(tag, successCallback, errorCallback));
    },

    getAlbumsForTagRecursive: function (albumsRequest) {
    	var albumsOptions = options.createAlbumsOptions(albumsRequest.tag, albumsRequest.page);
		var api = this;

        request(albumsOptions, function(error, response, data) {
			if(error || response.statusCode != 200) {

				if(response.statusCode == 503 && albumsRequest.errorCount < 3)
				{
					albumsRequest.errorCount += 1;
					setTimeout(
						function() { api.getAlbumsForTagRecursive(albumsRequest); },
						100);
					return;
				}

				console.error("Album retrieval failed on page " + albumsRequest.page +
					"\nStatuscode: " + response.statusCode +
					"\nError: " + error);

				albumsRequest.errorCallback();
				return;
			}

			albumsRequest.errorCount = 0;
			albumsRequest.albums = albumsRequest.albums.concat(
				data.items.map(function(x) { return api.convertToAlbum(x); }));
			albumsRequest.maxIndex = Math.ceil(data.total_count/48.0);
			albumsRequest.page += 1;

			if(albumsRequest.page > albumsRequest.maxIndex)
			{
				albumsRequest.successCallback(albumsRequest.albums);
			}
			else
			{
				api.getAlbumsForTagRecursive(albumsRequest);
			}
		});
    },

    getTagsForAlbum: function(album, successCallback) {
    	var tagsOptions = options.createTagsOptions(album.bandId, album.albumId);
		var api = this;

        request(tagsOptions, function(error, response, data) {
			if(error || response.statusCode != 200) {
				console.error("Unable to get tags for " + album +
					"\nStatuscode: " + response.statusCode +
					"\nError: " + error);

				return;
			}

			var tagNames = data.tags.map(function(tag) { return tag.norm_name; });
			successCallback(tagNames);
		});
    },

    convertToAlbum: function(bandcampAlbum) {
		var albumUrl = bandcampAlbum.url_hints;
		var album = new Album(
			bandcampAlbum.primary_text,
			bandcampAlbum.secondary_text,
			"https://f4.bcbits.com/img/a" + bandcampAlbum.art_id + "_11.jpg",
			"https://" + albumUrl.subdomain + ".bandcamp.com/album/" + albumUrl.slug,
			bandcampAlbum.band_id,
			bandcampAlbum.id);

		return album;
	}
};