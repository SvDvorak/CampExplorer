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

		var tags = [];//this.database.getTags();

		if(tags.length > 0 && this.updater.isIdle())
		{
			var tagToCache = tags[this.tagIndex];

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