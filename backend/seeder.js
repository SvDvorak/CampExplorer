var Promise = require("bluebird");
const { debug } = require("request-promise");
const { BCtags, timeout } = require("./extensions");

module.exports = Seeder = function(bandcampApi, log) {
	this.bandcampApi = bandcampApi;
	this.log = log;
};

Seeder.prototype = {
	seed: async function(tag) {
		var seeder = this;
		seeder.log("Seeding tags for all albums under " + tag);

		let newAlbums = await seeder.bandcampApi.getAlbumsForTag(tag);
		return await seeder.updateTagsForAllAlbums(newAlbums.slice(0, 500), tag);
	},

	updateTagsForAllAlbums: async function(albums, startTag) {
		var seeder = this;

		let tags = [ startTag ];

		for(const albumWithTags of albums) {
			try {
				const newTags = await seeder.bandcampApi.getTagsForAlbum(albumWithTags);
				await timeout(300);
				tags = tags.concat(newTags);
			}
			catch(error) {
					seeder.log(`Unable to get tags for ${albumWithTags.name} with band id ${albumWithTags.bandId} and album id ${albumWithTags.id} because ${error}`);
					seeder.log("Continuing with next tag");
			}
		}

		return BCtags(tags.getUnique());
	},
};

Array.prototype.getUnique = function() {
    var seen = {};
    return this.filter(function(item) {
        return seen.hasOwnProperty(item) ? false : (seen[item] = true);
    });
}