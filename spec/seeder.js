var Cache = require("../server/album-cache");
var CacheUpdater = require("../server/cache-updater");
var Seeder = require("../server/seeder");

describe("Seeder", function() {
	var bandcamp;
	var cache;
	var seeder;
	var updatedTags;
	var updateCallback;
	var tagsCallback;

	beforeEach(function() {
		updatedTags = [];
		updateCallback = function() { };
		tagsCallback = function() { };

		bandcamp = { getTagsForAlbum: function(album, callback) {
			tagsCallback = callback;
		}};
		updater = { updateTags: function(tags, callback) {
			updatedTags = updatedTags.concat(tags);
			updateCallback = callback;
		}};
		seeder = new Seeder(updater, bandcamp)
	});

	var getAlbumNamesFor = function(tag) {
		return cache.albums[tag].map(function(album) { return album.name; });
	}

	it("should update initial tag", function() {
		seeder.seed("pop");

		expect(updatedTags).toEqual([ "pop" ]);
	});

	it("should for each initial tag album result update their tags too", function() {
		seeder.seed("pop");

		updateCallback([ { name: "PopAlbum" } ]);
		tagsCallback([ "rock", "metal", "ambient" ]);

		expect(updatedTags).toEqual([ "pop", "rock", "metal", "ambient" ])
	});
});