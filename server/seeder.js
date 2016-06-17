

module.exports = Seeder = function(updater, bandcampApi, log) {
	this.updater = updater;
	this.bandcampApi = bandcampApi;
	this.alreadySeeded = {}
	this.log = log;
};

Seeder.prototype = {
	seed: function(tag, done) {
		var seeder = this;
		this.log("Seeding tags for all albums under " + tag);

		seeder.updater.updateUncachedTags([ tag ], function(newAlbums) {
			seeder.updateTagsForAllAlbums(newAlbums.slice(0, 50), [], done);
		});
	},

	updateTagsForAllAlbums: function(albums, previousTags, done) {
		var seeder = this;
		var count = albums.length;
		seeder.bandcampApi.getTagsForAlbum(albums[count - 1], function(newTags) {
			tags = previousTags.concat(newTags);
			count = count - 1;
	        albums.splice(count, 1);
    		if(count == 0) {
				seeder.updater.updateUncachedTags(tags);
				if(done != undefined) { done(); }
				return;
			}
	        seeder.updateTagsForAllAlbums(albums, tags, done);
		});
	}
};