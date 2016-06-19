
module.exports = InitialDataLoader = function(config, readJson, albumsCache, updater, seeder) {
	this.config = config;
	this.readJson = readJson;
	this.albumsCache = albumsCache;
	this.updater = updater;
	this.seeder = seeder;
}

InitialDataLoader.prototype = {
	load: function(done) {
		var loader = this;
		var callSeed = function() { loader.seed(done); };

		if(this.config.persistPath != undefined) {
			var saveCache = function(data) {
				loader.albumsCache.albums = data;
				done();
			};

			this.readJson.async(
				this.config.persistPath,
				saveCache,
				callSeed);
		}
		else {
			callSeed();
		}
	},

	seed: function(done) {
		if(this.config.startSeed == undefined) {
			done();
			return;
		}

		var loader = this;
		this.seeder.seed(this.config.startSeed, function(tags) {
			loader.updater.updateTags(tags, function() {
				if(loader.updater.isIdle()) {
					done();
				}
			});
		});
	}
}