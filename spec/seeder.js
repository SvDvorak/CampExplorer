var Cache = require("../server/album-cache");
var CacheUpdater = require("../server/cache-updater");
var Seeder = require("../server/seeder");
var BandcampFake = require("./bandcamp-fake");
var generateAlbums = require("./generate-albums");
require("../server/extensions");

describe("Seeder", function() {
	var bandcamp;
	var cache;
	var seeder;
	var updatedTags;
	var albumsCallback;
	var tagsCallback;

	beforeEach(function() {
		updatedTags = [];
		albumsCallback = function() { };
		tagsCallback = function() { };

		bandcamp = new BandcampFake();
		updater = { updateUncachedTags: function(tags, callback) {
			updatedTags = updatedTags.concat(tags);
			albumsCallback = callback;
		}};
		seeder = new Seeder(updater, bandcamp, function() { });
	});

	var getAlbumNamesFor = function(tag) {
		return cache.albums[tag].map(function(album) { return album.name; });
	}

	it("should retrieve initial tag", function() {
		bandcamp.setAlbumsForTag("pop", []);

		var tags = [];
		seeder.seed("pop", function(newTags) { tags = newTags });

		expect(tags).toEqual([ "pop" ]);
	});

	it("should for each initial tag album result retrieve their tags consecutively too", function() {
		var album1 = { name: "PopAlbum1" };
		var album2 = { name: "PopAlbum2" };

		bandcamp.setAlbumsForTag("pop", [ album2, album1 ]);
		bandcamp.setTagsForAlbum(album1, [ "rock", "ambient" ])
		bandcamp.setTagsForAlbum(album2, [ "metal", "ambient" ])

		var tags = [];
		seeder.seed("pop", function(newTags) { tags = newTags });

		expect(tags).toEqual([ "pop", "rock", "ambient", "metal", "ambient" ])
	});

	it("should only retrieve tags for first 50 albums plus one for start tag", function() {
		var callbacks = 0;

		var albums = generateAlbums(500);

		bandcamp.setAlbumsForTag("pop", albums);
		albums.forEach(function(album) {
			bandcamp.setTagsForAlbum(album, album.name);
		});

		var tags = [];
		seeder.seed("pop", function(newTags) { tags = newTags });

		expect(tags.length).toBe(51);
	});
});