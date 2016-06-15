

module.exports = Seeder = function(updater, bandcampApi) {
	this.updater = updater;
	this.bandcampApi = bandcampApi;
	this.alreadySeeded = {}
};

Seeder.prototype = {
	seed: function(tag) {
		var seeder = this;

		seeder.updater.updateTags([ tag ], function(newAlbums) {
			newAlbums.forEach(function(album) {
				seeder.bandcampApi.getTagsForAlbum(album, function(tags) {
					seeder.updater.updateTags(tags);
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