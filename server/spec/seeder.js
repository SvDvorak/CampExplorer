var Seeder = require("../source/seeder");
var BandcampFake = require("./bandcamp-fake");
var generateAlbums = require("./generate-albums");
require("../source/extensions");
require("./test-finished");

describe("Seeder", function() {
	var bandcamp;
	var seeder;

	beforeEach(function() {
		bandcamp = new BandcampFake();
		seeder = new Seeder(bandcamp, function() { });
	});

	it("should retrieve initial tag", function(done) {
		bandcamp.setAlbumsForTag("pop", []);

		seeder.seed("pop")
			.then(tags => expect(tags).toEqual([ "pop" ]))
			.testFinished(done);
	});

	it("should for each initial tag album result retrieve their tags consecutively too", function(done) {
		var album1 = { name: "PopAlbum1" };
		var album2 = { name: "PopAlbum2" };

		bandcamp.setAlbumsForTag("pop", [ album2, album1 ]);
		bandcamp.setTagsForAlbum(album1, [ "rock", "ambient" ])
		bandcamp.setTagsForAlbum(album2, [ "metal" ])

		seeder.seed("pop")
			.then(tags => expect(tags).toEqual([ "pop", "rock", "ambient", "metal" ]))
			.testFinished(done);
	});

	it("should only retrieve tags for first 500 albums plus one for start tag", function(done) {
		var callbacks = 0;

		var albums = generateAlbums(1000);

		bandcamp.setAlbumsForTag("pop", albums);
		albums.forEach(album => bandcamp.setTagsForAlbum(album, album.name));

		var tags = [];
		seeder.seed("pop")
			.then(tags => expect(tags.length).toBe(501))
			.testFinished(done);
	});

	it("filters duplicate tags", function(done) {
		var album = { name: "Album" };

		bandcamp.setAlbumsForTag("pop", [ album ]);
		bandcamp.setTagsForAlbum(album, [ "pop", "rock" ])

		var tags = [];
		seeder.seed("pop")
			.then(tags => expect(tags).toEqual([ "pop", "rock" ]))
			.testFinished(done);
	});
});