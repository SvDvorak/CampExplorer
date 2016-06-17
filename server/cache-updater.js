
module.exports = CacheUpdater = function(cache, albumApi, log) {
	this.cache = cache;
	this.albumApi = albumApi;
	this.log = log;
	if(log == undefined) {
		this.log = function(text) { };
	}
	this.queue = [];
	this.inProgress = undefined;
}

CacheUpdater.prototype = { 
    updateUncachedTags: function(tags, onTagAlbumsUpdated) {
        var uncached = this.cache.filterUncached(tags);
        this.updateTags(uncached, onTagAlbumsUpdated);
    },

	updateTags: function(tags, onTagAlbumsUpdated) {
        var updater = this;
        var cache = this.cache;
        var albumApi = this.albumApi;

        updater.queue = updater.queue.concat(
            tags.filter(function(tag) { return updater.queue.indexOf(tag) == -1; }));

        if(this.queue.length > 0 && this.inProgress == undefined)
        {
            var tag = this.queue[0];
            this.inProgress = tag;
            this.log("Processing " + tag);
            albumApi.getAlbumsForTag(tag, function(newAlbums) {
                cache.albums[tag] = newAlbums;
                updater.removeFromQueue(tag);
                updater.inProgress = undefined;
                updater.log("Finished " + tag);

            	if(onTagAlbumsUpdated != undefined)
            	{
            		onTagAlbumsUpdated(newAlbums);
            	}

                updater.updateTags([], onTagAlbumsUpdated);
            }, function() {
                updater.inProgress = undefined;

            	updater.updateTags([], onTagAlbumsUpdated);
            });
        }
	},

    removeFromQueue: function(tag) {
        var i = this.queue.indexOf(tag);
        if(i != -1) {
            this.queue.splice(i, 1);
        }
    },
};