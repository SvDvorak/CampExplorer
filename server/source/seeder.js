var Promise = require("bluebird");
require("./extensions");

module.exports = Seeder = function(bandcampApi, log) {
	this.bandcampApi = bandcampApi;
	this.alreadySeeded = {}
	this.log = log;
};

Seeder.prototype = {
	seed: function(tag, onResult) {
		var seeder = this;
		seeder.log("Seeding tags for all albums under " + tag);

		return seeder.bandcampApi.getAlbumsForTag(tag)
			.then(newAlbums => seeder.updateTagsForAllAlbums(newAlbums.slice(0, 500), [ tag ]));
	},

	updateTagsForAllAlbums: function(albums, previousTags) {
		var seeder = this;
		var count = albums.length;

		if(count <= 0) {
			return Promise.resolve(previousTags.getUnique().BCvalues());
		}

		return seeder.bandcampApi
			.getTagsForAlbum(albums[count - 1])
			.then(newTags => {
				tags = previousTags.concat(newTags);
				count = count - 1;
				albums.splice(count, 1);
				return seeder.updateTagsForAllAlbums(albums, tags);
			});
	}
};

Array.prototype.getUnique = function() {
    var seen = {};
    return this.filter(function(item) {
        return seen.hasOwnProperty(item) ? false : (seen[item] = true);
    });
}