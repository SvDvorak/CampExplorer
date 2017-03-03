var Promise = require("bluebird");

module.exports = Recacher = function(albumCache, updater, log) {
	this.albumCache = albumCache;
	this.updater = updater;
	this.tagIndex = 0;
	this.log = log;
};

Recacher.prototype = {
	execute: function() {
		var recacher = this;

		var tags = Object.keys(this.albumCache.albums);

		if(tags.length > 0 && this.updater.isIdle())
		{
			var tagToCache = tags[this.tagIndex];
			this.log("Recaching");

			this.tagIndex += 1;
			if(this.tagIndex >= tags.length) {
				this.tagIndex = 0;
			}

			return new Promise((resolve, reject) => {
				this.updater.updateTags([ tagToCache ], resolve);
			});
		}
		else
		{
			return Promise.resolve();
		}
	},
};