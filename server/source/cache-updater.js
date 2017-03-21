
module.exports = CacheUpdater = function(albumApi, database, log) {
	this.albumApi = albumApi;
    this.database = database;
	this.log = log;
	this.queue = [];
	this.inProgress = undefined;
}

CacheUpdater.prototype = { 
	updateTags: function(tags, onTagAlbumsUpdated) {
        var updater = this;

        updater.queue = updater.queue.concat(
            tags.filter(tag => { return updater.queue.indexOf(tag) == -1; }));

        updater.updateTagsRecursive(onTagAlbumsUpdated);
	},

    updateTagsRecursive: function(onTagAlbumsUpdated) { 
        var updater = this;
        var database = this.database;
        var albumApi = this.albumApi;

        if(this.queue.length == 0) {
            updater.callIfDefined(onTagAlbumsUpdated);
        }
        else if(this.inProgress == undefined) {
            var tag = this.queue[0];
            this.inProgress = tag;
            albumApi.getAlbumsForTag(tag, newAlbums => {
                database.saveTag(tag);
                database.saveAlbums(tag, newAlbums);
                updater.removeFromQueue(tag);

                updater.inProgress = undefined;
                updater.updateTagsRecursive(onTagAlbumsUpdated);
            }, () => {
                updater.inProgress = undefined;

                updater.updateTagsRecursive(onTagAlbumsUpdated);
            });
        }
    },

    isIdle: function() {
        return this.queueLength() == 0;
    },

    queueLength: function() {
        return this.queue.length;
    },

    currentlyCachingTag: function() {
        return this.inProgress;
    },

    removeFromQueue: function(tag) {
        var i = this.queue.indexOf(tag);
        if(i != -1) {
            this.queue.splice(i, 1);
        }
    },

    callIfDefined: function(callback) {
        if(callback != undefined)
        {
            callback();
        }
    }
};