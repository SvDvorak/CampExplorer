var Promise = require("bluebird");

module.exports = CacheUpdater = function(albumApi, database, log) {
	this.albumApi = albumApi;
    this.database = database;
	this.log = log;
	this.queue = [];
	this.inProgress = undefined;
    this.updatingPromise = Promise.resolve();
}

CacheUpdater.prototype = { 
	updateTags: function(tags) {
        var updater = this;

        updater.queue = updater.queue.concat(
            tags.filter(tag => { return updater.queue.indexOf(tag) == -1; }));

        if(this.inProgress == undefined) {
            this.updatingPromise = new Promise((resolve, reject) => updater.updateTagsRecursive(resolve));
        }

        return Promise.resolve(this.updatingPromise);
	},

    updateTagsRecursive: function(resolve) { 
        var updater = this;
        var database = this.database;
        var albumApi = this.albumApi;

        if(this.queue.length == 0) {
            resolve();
            return;
        }

        var tag = this.queue[0];
        this.inProgress = tag;
        albumApi.getAlbumsForTag(tag)
            .then(albums => database.saveAlbums(tag, albums))
            .then(() => database.saveTag(tag))
            .catch(ex => updater.log("Unable to update " + tag + " because " + JSON.stringify(ex)))
            .finally(() => {
                updater.inProgress = undefined
                updater.removeFromQueue(tag);
                updater.updateTagsRecursive(resolve);
            });
    },

    isIdle: function() {
        return !this.updatingPromise.isPending();
    },

    queueLength: function() {
        return this.queue.length;
    },

    currentlyCachingTag: function() {
        if(this.inProgress == undefined)
            return "";
        return this.inProgress;
    },

    removeFromQueue: function(tag) {
        var i = this.queue.indexOf(tag);
        if(i != -1) {
            this.queue.splice(i, 1);
        }
    },
};