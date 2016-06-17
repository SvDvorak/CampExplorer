var Cache = require("../server/album-cache");
var CacheUpdater = require("../server/cache-updater");
var Seeder = require("../server/seeder");
var generateAlbums = require("./generate-albums");
require("../server/extensions");

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
			tagsCallback[album] = callback;
		}};
		updater = { updateUncachedTags: function(tags, callback) {
			updatedTags = updatedTags.concat(tags);
			updateCallback = callback;
		}};
		seeder = new Seeder(updater, bandcamp, function() { });
	});

	var getAlbumNamesFor = function(tag) {
		return cache.albums[tag].map(function(album) { return album.name; });
	}

	it("should update initial tag", function() {
		seeder.seed("pop");

		expect(updatedTags).toEqual([ "pop" ]);
	});

	it("should for each initial tag album result update their tags consecutively too", function() {
		seeder.seed("pop");

		var album1 = { name: "PopAlbum1" };
		var album2 = { name: "PopAlbum2" };

		updateCallback([ album1, album2 ]);
		expect(updatedTags).toEqual([ "pop" ])
		tagsCallback[album1]([ "rock", "ambient" ]);
		expect(updatedTags).toEqual([ "pop" ])
		tagsCallback[album2]([ "metal", "ambient" ]);

		expect(updatedTags).toEqual([ "pop", "rock", "ambient", "metal", "ambient" ])
	});

	it("should only get tags for 50 albums", function() {
		var callbacks = 0;

		bandcamp.getTagsForAlbum = function(album, callback) {
			callbacks += 1;
			callback([ album.name ]);
		};

		var albums = generateAlbums(500);

		seeder.seed("tag");

		updateCallback(albums);

		expect(callbacks).toBe(50);
	});
});