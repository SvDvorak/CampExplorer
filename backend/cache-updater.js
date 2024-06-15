const { debugLog } = require("./extensions");

module.exports = CacheUpdater = function (albumApi, database, log) {
	this.albumApi = albumApi;
	this.database = database;
	this.log = log;
	this.queue = [];
	this.inProgress = undefined;
}

CacheUpdater.prototype = {
	updateTags: async function (tags) {
		var updater = this;

		updater.queue = updater.queue.concat(
			tags.filter(tag => { return updater.queue.indexOf(tag) == -1; }));

		if (this.isIdle()) {
			await updater.updateTagsLoop();
		}
	},

	updateTagsLoop: async function () {
		var updater = this;
		var database = this.database;
		var albumApi = this.albumApi;

		this.isUpdating = true;

		while (this.queue.length > 0) {
			const tag = this.queue[0];
			this.inProgress = tag;
			try {
				debugLog(this.log, `Updating tag ${tag}`);
				const albums = await albumApi.getAlbumsForTag(tag);
				debugLog(this.log, `Retrieved ${albums.length} albums`);
				await database.saveAlbums(tag, albums);
				await database.saveTag(tag);
			}
			catch (error) {
				updater.log(`Unable to update ${tag} because ${error}`);
			}
			finally {
				updater.inProgress = undefined
				updater.removeFromQueue(tag);
			}
		}

		this.isUpdating = false;
	},

	isIdle: function () {
		return !this.isUpdating;
	},

	queueLength: function () {
		return this.queue.length;
	},

	currentlyCachingTag: function () {
		if (this.inProgress == undefined)
			return "";
		return this.inProgress;
	},

	removeFromQueue: function (tag) {
		var i = this.queue.indexOf(tag);
		if (i != -1) {
			this.queue.splice(i, 1);
		}
	},
};