const database = require("./database");
const { debugLog } = require("./extensions");

module.exports = CacheUpdater = function (bandcampApi, database, log) {
	this.bandcampApi = bandcampApi;
	this.database = database;
	this.log = log;
	this.queue = [];
	this.inProgress = undefined;
}

CacheUpdater.prototype = {
	createUpdateTagOperation: function(tag) {
		return new UpdateTagOperation(tag, this.bandcampApi, this.database, this.log); 
	},
	createUpdateAlbumOperation: function(album) {
		return new UpdateAlbumOperation(album, this.bandcampApi, this.database, this.log); 
	},

	updateTags: async function(tags) {
		var updater = this;
		this.queueUpOperation(tags.map(x => updater.createUpdateTagOperation(x)));

		await updater.updateLoop();
	},

	updateAlbum: async function(album) {
		var updater = this;
		var operation = updater.createUpdateAlbumOperation(album);
		this.queueUpOperation([operation]);

		await updater.updateLoop();
	},

	updateLoop: async function () {
		if (!this.isIdle()) {
			return;
		}

		this.isUpdating = true;

		while (this.queue.length > 0) {
			const operation = this.queue[0];
			this.inProgress = operation;
			await operation.execute();
			this.inProgress = undefined;
			this.removeFromQueue(operation);
		}

		this.isUpdating = false;
	},

	isIdle: function () {
		return !this.isUpdating;
	},

	queueUpOperation: function(newOperations) {
		var updater = this;
		updater.queue = updater.queue.concat(
			newOperations.filter(x => !updater.queue.some(y => x.isSameOperation(y))));
	},

	queueLength: function () {
		return this.queue.length;
	},

	currentlyCaching: function () {
		if (this.inProgress == undefined)
			return "";
		return this.inProgress.getName();
	},

	removeFromQueue: function (operation) {
		var i = this.queue.indexOf(operation);
		if (i != -1) {
			this.queue.splice(i, 1);
		}
	},
};

UpdateTagOperation = function(tag, bandcampApi, database, log) {
	this.tag = tag;
	this.bandcampApi = bandcampApi;
	this.database = database;
	this.log = log;
}

UpdateTagOperation.prototype = {
	execute: async function() {
		try {
			debugLog(this.log, `Updating tag ${this.tag}`);
			const albums = await this.bandcampApi.getAlbumsForTag(this.tag);
			debugLog(this.log, `Retrieved ${albums.length} albums`);
			await this.database.saveTagAlbums(this.tag, albums);
			await this.database.saveTag(this.tag);
		}
		catch (error) {
			this.log(`Unable to update ${this.tag} because ${error}`);
		}
	},
	getName: function() {
		return "T: " + this.tag;
	},
	isSameOperation: function(other) {
		return other instanceof UpdateTagOperation && this.tag == other.tag;
	}
}

UpdateAlbumOperation = function(album, bandcampApi, database, log) {
	this.album = album;
	this.bandcampApi = bandcampApi;
	this.database = database;
	this.log = log;
}

UpdateAlbumOperation.prototype = {
	execute: async function() {
		try {
			debugLog(this.log, `Updating album ${this.album.name}`);
			const newTags = await this.bandcampApi.getTagsForAlbum(this.album);
			debugLog(this.log, `Retrieved ${newTags.length} tags for album`);
			this.album.hasTagsBeenUpdated = true;
			await this.database.saveAlbum(this.album, newTags);
			// Deliberately not updating tags, because we want a full tag search when that tag is first asked for
		}
		catch (error) {
			this.log(`Unable to update ${this.album.name} because ${error}`);
		}
	},
	getName: function() {
		return "A: " + this.album.name;
	},
	isSameOperation: function(other) {
		return other instanceof UpdateAlbumOperation && this.album.link == other.tag;
	}
}