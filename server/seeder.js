

module.exports = Seeder = function(updater, bandcampApi) {
	this.updater = updater;
	this.bandcampApi = bandcampApi;
	this.alreadySeeded = {}
};

Seeder.prototype = {
	seed: function(tag) {
		var seeder = this;

		seeder.updater.queueTags([ tag ], function(newAlbums) {
			newAlbums.forEach(function(album) {
				seeder.bandcampApi.getTagsForAlbum(album, function(tags) {
					seeder.updater.queueTags(tags);
				});
			});
		});
	}
};

function flatten(list) {
    return []
        .concat
        .apply([], list);
}