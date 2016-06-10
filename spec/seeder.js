var Cache = require("../server/album-cache");
var CacheUpdater = require("../server/cache-updater");
var Seeder = require("../server/seeder");

describe("Seeder", function() {
	var bandcamp;
	var cache;
	var seeder;
	var queuedTags;
	var queueCallback;
	var tagsCallback;

	beforeEach(function() {
		queuedTags = [];
		queueCallback = function() { };
		tagsCallback = function() { };

		bandcamp = { getTagsForAlbum: function(album, callback) {
			tagsCallback = callback;
		}};
		updater = { queueTags: function(tags, callback) {
			queuedTags = queuedTags.concat(tags);
			queueCallback = callback;
		}};
		seeder = new Seeder(updater, bandcamp)
	});

	var getAlbumNamesFor = function(tag) {
		return cache.albums[tag].map(function(album) { return album.name; });
	}

	it("should queue initial tag", function() {
		seeder.seed("pop");

		expect(queuedTags).toEqual([ "pop" ]);
	});

	it("should for each initial tag album result queue their tags too", function() {
		seeder.seed("pop");

		queueCallback([ { name: "PopAlbum" } ]);
		tagsCallback([ "rock", "metal", "ambient" ]);

		expect(queuedTags).toEqual([ "pop", "rock", "metal", "ambient" ])
	});
});