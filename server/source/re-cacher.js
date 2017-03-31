var Promise = require("bluebird");

module.exports = Recacher = function(database, updater, log) {
	this.database = database;
	this.updater = updater;
	this.tagIndex = 0;
	this.log = log;
};

Recacher.prototype = {
	execute: function() {
		var recacher = this;

		this.log("in recacher execute");
		return this.database.getSavedTags()
			.then(tags => {
				recacher.log("recacher got tags, is idle? " + recacher.updater.isIdle());
				recacher.log("recacher got tags: " + JSON.stringify(tags));
				if(tags.length > 0 && recacher.updater.isIdle())
				{
					var tagToCache = tags[recacher.tagIndex];
					recacher.log("Recaching " + tagToCache);

					recacher.tagIndex += 1;
					if(recacher.tagIndex >= tags.length) {
						recacher.tagIndex = 0;
					}

					return recacher.updater.updateTags([ tagToCache ]);
				}
				else
				{
					return Promise.resolve();
				}
			})
			.catch(() => recacher.log("Failed recaching"));
	},
};