var Seeder = require("../seeder");
var BandcampFake = require("./bandcamp-fake");
var generateAlbums = require("./generate-albums");

describe("Seeder", () => {

	var bandcamp;
	var seeder;

	beforeEach(async () => {
		bandcamp = new BandcampFake();
		seeder = new Seeder(bandcamp, async () => { }, () => { });
	});

	it("should retrieve initial tag", async () => {
		bandcamp.setAlbumsForTag("pop", []);

		const tags = await seeder.seed("pop");
		expect(tags).toEqual([ "pop" ]);
	});

	it("should for each initial tag album result retrieve their tags consecutively too", async () => {
		var album1 = { name: "PopAlbum1" };
		var album2 = { name: "PopAlbum2" };

		bandcamp.setAlbumsForTag("pop", [ album2, album1 ]);
		bandcamp.setTagsForAlbum(album1, [ "rock", "ambient" ])
		bandcamp.setTagsForAlbum(album2, [ "metal" ])

		const tags = await seeder.seed("pop")
		expect(tags).toEqual([ "pop", "metal", "rock", "ambient" ]);
	});

	it("should only retrieve tags for first 500 albums plus one for start tag", async () => {
		var albums = generateAlbums(1000);

		bandcamp.setAlbumsForTag("pop", albums);
		albums.forEach(album => bandcamp.setTagsForAlbum(album, album.name));

		const tags = await seeder.seed("pop")
		expect(tags.length).toBe(501);
	});

	it("filters duplicate tags", async () => {
		var album = { name: "Album" };

		bandcamp.setAlbumsForTag("pop", [ album ]);
		bandcamp.setTagsForAlbum(album, [ "pop", "rock" ])

		const tags = await seeder.seed("pop")
		expect(tags).toEqual([ "pop", "rock" ]);
	});
});