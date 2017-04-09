var Promise = require("bluebird");
require("./extensions");

module.exports = Seeder = function(bandcampApi, log) {
	this.bandcampApi = bandcampApi;
	this.alreadySeeded = {}
	this.log = log;
};

Seeder.prototype = {
	seed: function(tag) {
		var seeder = this;
		seeder.log("Seeding tags for all albums under " + tag);

		return seeder.bandcampApi.getAlbumsForTag(tag)
			.then(newAlbums => seeder.updateTagsForAllAlbums(newAlbums.slice(0, 500), [ tag ]));
	},

	updateTagsForAllAlbums: function(albums, previousTags) {
		var seeder = this;

		if(albums.length <= 0) {
			return Promise.resolve(previousTags.getUnique().BCvalues());
		}

		var albumWithTags = albums[albums.length - 1];

		return seeder.bandcampApi
			.getTagsForAlbum(albumWithTags)
			.then(newTags => {
				tags = previousTags.concat(newTags);
				return seeder.updateNextAlbum(albums, tags);
			})
			.catch(e => {
				seeder.log("Unable to get tags for " + albumWithTags.name + " with id " + albumWithTags.id + " because " + e);
				seeder.log("Continuing with next tag");
				return seeder.updateNextAlbum(albums, tags);
			});
	},

	updateNextAlbum: function(albums, tags) {
		var newCount = albums.length - 1;
		albums.splice(newCount, 1);
		return seeder.updateTagsForAllAlbums(albums, tags);
	}
};

Array.prototype.getUnique = function() {
    var seen = {};
    return this.filter(function(item) {
        return seen.hasOwnProperty(item) ? false : (seen[item] = true);
    });
}