var Promise = require("bluebird");

module.exports = InitialDataLoader = function(config, readJson, albumsCache, updater, seeder) {
	this.config = config;
	this.readJson = readJson;
	this.albumsCache = albumsCache;
	this.updater = updater;
	this.seeder = seeder;
}

InitialDataLoader.prototype = {
	load: function() {
		var loader = this;
		var callSeed = function() { return loader.seed(); };

		if(this.config.persistPath != undefined) {
			var loadCache = data => { loader.albumsCache.albums = data; };

			return this.readJson.async(this.config.persistPath)
				.then(loadCache)
				.catch(callSeed);
		}
		else {
			return callSeed();
		}
	},

	seed: function() {
		if(this.config.startSeed == undefined) {
			return Promise.resolve();
		}

		var loader = this;
		return new Promise((resolve, reject) => {
			this.seeder.seed(this.config.startSeed, function(tags) {
				loader.updater.updateTags(tags, function() {
						resolve();
				});
			});
		});
	}
}