
module.exports = Recacher = function(albumCache, updater, log) {
	this.albumCache = albumCache;
	this.updater = updater;
	this.tagIndex = 0;
	this.cacheDelay = 30;
	this.log = log;
};

Recacher.prototype = {
	start: function() {
		this.running = true;
		this.recache();
	},

	stop: function() {
		this.running = false;
	},

	recache: function() {
		var recacher = this;

		if(!this.running) {
			return;
		}

		var rerunRecache = function() {
			setTimeout(function() { recacher.recache() }, recacher.cacheDelay*1000)
		};

		var tags = Object.keys(this.albumCache.albums);

		if(tags.length > 0 && this.updater.isIdle())
		{
			var tagToCache = tags[this.tagIndex];
			this.log("Recaching");

			this.updater.updateTags([ tagToCache ], function() {
				rerunRecache();
			});

			this.tagIndex += 1;
			if(this.tagIndex >= tags.length) {
				this.tagIndex = 0;
			}
		}
		else
		{
			rerunRecache();
		}
	},
};