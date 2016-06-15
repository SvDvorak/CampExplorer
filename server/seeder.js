

module.exports = Seeder = function(updater, bandcampApi) {
	this.updater = updater;
	this.bandcampApi = bandcampApi;
	this.alreadySeeded = {}
};

Seeder.prototype = {
	seed: function(tag) {
		var seeder = this;

		seeder.updater.updateTags([ tag ], function(newAlbums) {
			console.log("Updating tags for all albums under " + tag);
			newAlbums.forEach(function(album) {
				seeder.bandcampApi.getTagsForAlbum(album, function(tags) {
					seeder.updater.updateTags(tags);
				});
			});
		});
	}
};