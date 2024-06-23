var request = require("request");
var options = require("./bandcamp-options");
var Promise = require("bluebird");
var Album = require("./album-type");

module.exports = Bandcamp = function (log) {
	this.log = log;
}

var AlbumsRequest = function (tag, resolve, reject) {
	this.tag = tag;
	this.albums = [];
	this.page = 0;
	this.maxIndex = 1;
	this.errorCount = 0;
	this.isDone = false;
	this.resolve = resolve;
	this.reject = reject;
}

AlbumsRequest.prototype = {
	createOptions: function() {
		return options.createAlbumsOptions(this.tag, this.page);
	},
	parseData: function(data) {
		if (data.items == undefined) {
			this.reject(new Error("Items in data undefined, actual data:" + JSON.stringify(data)));
			return;
		}

		var albumRequest = this;
		this.errorCount = 0;
		this.albums = this.albums.concat(
			data.items.map(function (x) { return albumRequest.convertToAlbum(x); }));
		this.maxIndex = Math.ceil(data.total_count / 48.0);
		this.page += 1;

		if (this.page > this.maxIndex) {
			this.isDone = true;
			this.resolve(this.albums)
		}
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
	},
	tooManyRequestsMessage: function() {
		return `Retrieving albums for ${this.tag} on page ${this.page}`;
	},
	retrievalFailed: function(error, statusCode, data) {
		this.reject(new Error(
			"Album retrieval failed on page " + this.page +
			"\nStatuscode: " + statusCode +
			"\nError: " + error));
	}
}

var TagsRequest = function(album, resolve, reject) {
	this.album = album;
	this.errorCount = 0;
	this.isDone = false;
	this.resolve = resolve;
	this.reject = reject;
}

TagsRequest.prototype = {
	createOptions: function() {
		return options.createTagsOptions(this.album.bandId, this.album.id);
	},
	parseData: function(data) {
		var tagNames = data.tags.map(function (tag) { return tag.norm_name; });
		this.isDone = true;
		this.resolve(tagNames);
	},
	tooManyRequestsMessage: function() {
		return `Retrieving tags for ${this.album.artist} with album ${this.album.name}`;
	},
	retrievalFailed: function(error, statusCode, data) {
		if(data != null && data.error == true && data.error_message.startsWith("No such tralbum")) {
			this.reject(new Error("Album has been deleted"))
			return;
		}

		this.reject(new Error(
			"Tags retrieval failed for " + JSON.stringify(this.album) +
			"\nStatuscode: " + statusCode +
			"\nError: " + error +
			"\nData: " + JSON.stringify(data)));
	}
}

Bandcamp.prototype = {
	getAlbumsForTag: async function (tag) {
		var api = this;
		return new Promise((resolve, reject) => api.recursiveRequest(new AlbumsRequest(tag, resolve, reject)));
	},

	getTagsForAlbum: function (album) {
		var api = this;
		return new Promise((resolve, reject) => api.recursiveRequest(new TagsRequest(album, resolve, reject)));
	},

	recursiveRequest: function(dataRequest)
	{
		var api = this;

		request(dataRequest.createOptions(), function (error, response, data) {
			var statusCode = response != undefined ? response.statusCode : "undefined";

			if (error || statusCode != 200 || data.error == true) {
				if ((statusCode == 503 || statusCode == 429) && dataRequest.errorCount < 10) {
					dataRequest.errorCount += 1;
					let waitTime = 1000 * dataRequest.errorCount;
					api.log(`Error ${statusCode} - Too many requests: ${dataRequest.tooManyRequestsMessage()}. Error count ${dataRequest.errorCount}, will retry in ${waitTime}`)
					setTimeout(
						function () { api.recursiveRequest(dataRequest); },
						waitTime);
					return;
				}

				dataRequest.retrievalFailed(error, statusCode, data);
				return;
			}

			dataRequest.parseData(data);

			if(dataRequest.isDone == false) {
				// A slight delay to minimize 429: Too Many Requests
				setTimeout(function() { api.recursiveRequest(dataRequest); }, 200);
			}
		});
	}
};