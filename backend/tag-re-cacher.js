
module.exports = TagRecacher = function(database, updater, log) {
	this.database = database;
	this.updater = updater;
	this.log = log;
};

TagRecacher.prototype = {
	execute: async function() {
		if(!this.updater.isIdle()) {
			return;
		}

		try {
			const tag = await this.database.getTagWithOldestUpdate();
			if(tag != undefined) {
				await this.updater.updateTags([ tag ]);
			}
		}
		catch(e) {
				this.log("Failed recaching because " + e);
		}
	},
};