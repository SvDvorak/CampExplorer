var Promise = require("bluebird");

module.exports = Recacher = function(database, updater, log) {
	this.database = database;
	this.updater = updater;
	this.tagIndex = 0;
	this.log = log;
};

Recacher.prototype = {
	execute: function() {
		if(!this.updater.isIdle()) {
			return Promise.resolve();
		}

		var recacher = this;
		this.log("in recacher execute");
		return this.database.getTagWithOldestUpdate()
			.then(tag => {
				recacher.log("recacher got tag, is idle? " + recacher.updater.isIdle());
				recacher.log("recacher got tag: " + tag);

				return recacher.updater.updateTags([ tag ]);
			})
			.catch(e => recacher.log("Failed recaching because " + e));
	},
};