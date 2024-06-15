var request = require("request");
var options = require("./bandcamp-options");
var Promise = require("bluebird");
var Album = require("./api-types");

module.exports = Bandcamp = function (log) {
	this.log = log;
}

var AlbumsRequest = function (tag, successCallback, errorCallback) {
	this.albums = [];
	this.tag = tag;
	this.successCallback = successCallback;
	this.errorCallback = errorCallback;
	this.page = 0;
	this.maxIndex = 1;
	this.errorCount = 0;
}

Bandcamp.prototype = {
	getAlbumsForTag: async function (tag) {
		var api = this;
		return new Promise((resolve, reject) => api.getAlbumsForTagRecursive(new AlbumsRequest(tag, resolve, reject)));
	},

	getAlbumsForTagRecursive: function (albumsRequest) {
		var albumsOptions = options.createAlbumsOptions(albumsRequest.tag, albumsRequest.page);
		var api = this;

		request(albumsOptions, function (error, response, data) {
			var statusCode = response != undefined ? response.statusCode : "undefined";

			if (error || statusCode != 200) {
				if ((statusCode == 503 || statusCode == 429) && albumsRequest.errorCount < 10) {
					let waitTime = 1000 * (albumsRequest.errorCount + 1);
					api.log(`Error ${statusCode} - Too many requests: Retrieving ${albumsRequest.tag} page ${albumsRequest.page} - error count ${albumsRequest.errorCount}. Will retry in ${waitTime}`)
					albumsRequest.errorCount += 1;
					setTimeout(
						function () { api.getAlbumsForTagRecursive(albumsRequest); },
						waitTime);
					return;
				}

				albumsRequest.errorCallback(new Error(
					"Album retrieval failed on page " + albumsRequest.page +
					"\nStatuscode: " + statusCode +
					"\nError: " + error));
				return;
			}

			if (data.items == undefined) {
				albumsRequest.errorCallback(new Error("Items in data undefined, actual data:" + JSON.stringify(data)));
				return;
			}

			albumsRequest.errorCount = 0;
			albumsRequest.albums = albumsRequest.albums.concat(
				data.items.map(function (x) { return api.convertToAlbum(x); }));
			albumsRequest.maxIndex = Math.ceil(data.total_count / 48.0);
			albumsRequest.page += 1;

			if (albumsRequest.page > albumsRequest.maxIndex) {
				albumsRequest.successCallback(albumsRequest.albums);
			}
			else {
				// A slight delay to minimize 429: Too Many Requests
				setTimeout(function() { api.getAlbumsForTagRecursive(albumsRequest); }, 300);
			}
		});
	},
	getTagsForAlbum: function (album) {
		var api = this;
		return new Promise((resolve, reject) => api.getTagsForAlbumRecursive(album, resolve, reject, 0));
	},

	getTagsForAlbumRecursive: function (album, successCallback, errorCallback, retryCount) {
		var tagsOptions = options.createTagsOptions(album.bandId, album.id);
		var api = this;

		request(tagsOptions, function (error, response, data) {
			var statusCode = response != undefined ? response.statusCode : "undefined";

			if (error || statusCode != 200) {
				if (statusCode == 503 && retryCount < 3) {
					var nextRetryCount = retryCount + 1;
					setTimeout(
						function () { api.getTagsForAlbumRecursive(album, successCallback, errorCallback, nextRetryCount); },
						1000 * nextRetryCount);
					return;
				}

				errorCallback("Unable to get tags for " + album +
					"\nStatuscode: " + statusCode +
					"\nResponse:" + JSON.stringify(response) +
					"\nError: " + error);
				return;
			}

			var tagNames = data.tags.map(function (tag) { return tag.norm_name; });
			successCallback(tagNames);
		});
	},

	convertToAlbum: function (bandcampAlbum) {
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