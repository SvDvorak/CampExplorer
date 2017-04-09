var request = require("request");
var options = require("./bandcamp-options");
var Promise = require("bluebird");
var Album = require("./api-types");

module.exports = Bandcamp = function(log) {
	this.log = log;
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
    getAlbumsForTag: function (tag) {
		var api = this;
    	return new Promise((resolve, reject) => api.getAlbumsForTagRecursive(new AlbumsRequest(tag, resolve, reject)));
    },

    getAlbumsForTagRecursive: function (albumsRequest) {
    	var albumsOptions = options.createAlbumsOptions(albumsRequest.tag, albumsRequest.page);
		var api = this;

        request(albumsOptions, function(error, response, data) {
			var statusCode = response != undefined ? response.statusCode : "undefined";

			if(error || statusCode != 200) {
				if(statusCode == 503 && albumsRequest.errorCount < 3)
				{
					albumsRequest.errorCount += 1;
					setTimeout(
						function() { api.getAlbumsForTagRecursive(albumsRequest); },
						100*albumsRequest.errorCount);
					return;
				}

				api.log("Album retrieval failed on page " + albumsRequest.page +
					"\nStatuscode: " + statusCode +
					"\nError: " + error);

				albumsRequest.errorCallback();
				return;
			}

			if(data.items == undefined)
			{
				api.log("Items in data undefined, actual data:" + JSON.stringify(data));
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

    getTagsForAlbum: function(album) {
    	return new Promise((resolve, reject) => this.getTagsForAlbumRecursive(album, resolve, 0));
    },

    getTagsForAlbumRecursive: function(album, successCallback, retryCount) {
		var tagsOptions = options.createTagsOptions(album.bandId, album.id);
		var api = this;

        request(tagsOptions, function(error, response, data) {
			var statusCode = response != undefined ? response.statusCode : "undefined";

			if(error || statusCode != 200) {
	    		if(statusCode == 503 && retryCount < 3)
	    		{
					var nextRetryCount = retryCount + 1;
	    			setTimeout(
	    				function() { api.getTagsForAlbumRecursive(album, successCallback, nextRetryCount); },
	    				1000*nextRetryCount);
	    			return;
	    		}

				api.log("Unable to get tags for " + album +
					"\nStatuscode: " + statusCode +
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
			bandcampAlbum.id,
			bandcampAlbum.primary_text,
			bandcampAlbum.secondary_text,
			"https://f4.bcbits.com/img/a" + bandcampAlbum.art_id + "_11.jpg",
			"https://" + albumUrl.subdomain + ".bandcamp.com/album/" + albumUrl.slug,
			bandcampAlbum.band_id);

		return album;
	}
};