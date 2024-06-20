
module.exports = Recacher = function(database, updater, log) {
	this.database = database;
	this.updater = updater;
	this.tagIndex = 0;
	this.log = log;
};

Recacher.prototype = {
	execute: async function() {
		if(!this.updater.isIdle()) {
			return;
		}

		try {
			const tag = await this.database.getTagWithOldestUpdate();
			await this.updater.updateTags([ tag ]);
		}
		catch(e) {
				this.log("Failed recaching because " + e);
		}
	},
};