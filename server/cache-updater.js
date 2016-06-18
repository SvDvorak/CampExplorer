
module.exports = CacheUpdater = function(cache, albumApi, log) {
	this.cache = cache;
	this.albumApi = albumApi;
	this.log = log;
	this.queue = [];
	this.inProgress = undefined;
}

CacheUpdater.prototype = { 
	updateTags: function(tags, onTagAlbumsUpdated) {
        var updater = this;
        var cache = this.cache;
        var albumApi = this.albumApi;

        updater.queue = updater.queue.concat(
            tags.filter(function(tag) { return updater.queue.indexOf(tag) == -1; }));

        if(this.queue.length == 0) {
            updater.callIfDefined(onTagAlbumsUpdated, []);
            return;
        }

        if(this.inProgress == undefined)
        {
            var tag = this.queue[0];
            this.inProgress = tag;
            this.log("Processing " + tag);
            albumApi.getAlbumsForTag(tag, function(newAlbums) {
                cache.albums[tag] = newAlbums;
                updater.log("Finished " + tag);

                updater.callIfDefined(onTagAlbumsUpdated, newAlbums);

                updater.inProgress = undefined;
                updater.removeFromQueue(tag);
                updater.updateTags([], onTagAlbumsUpdated);
            }, function() {
                updater.inProgress = undefined;

            	updater.updateTags([], onTagAlbumsUpdated);
            });
        }
	},

    isIdle: function() {
        return this.queue.length == 0;
    },

    removeFromQueue: function(tag) {
        var i = this.queue.indexOf(tag);
        if(i != -1) {
            this.queue.splice(i, 1);
        }
    },

    callIfDefined: function(callback, data) {
        if(callback != undefined)
        {
            callback(data);
        }
    }
};