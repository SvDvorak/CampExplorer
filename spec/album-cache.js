var Cache = require("../server/album-cache");
var BandcampFake = require("../server/bandcamp-fake");
var Album = require("../api-types");

describe("Album cache", function() {
	var sut;
	var bandcamp;
	var disusedAlbum;
	var disusedTag

    beforeEach(function() {
    	bandcamp = new BandcampFake(false);
    	sut = new Cache(bandcamp);
    	disusedAlbum = new Album("Album2", "Artist2", "Image2", "Link2");
    	disusedTag = "deadtag";
    });

    it("returns albums matching single tag", function() {
    	var expectedAlbums =
	    	[
		    	new Album("Album1", "Artist1", "Image1", "Link1"),
		    	new Album("Album2", "Artist2", "Image2", "Link2")
	    	];

    	bandcamp.setAlbumsForTag("tag", expectedAlbums);
        sut.updateTags(["tag"]);

    	var actualAlbums = sut.getAlbumsByTags([ "tag" ]);

    	expect(actualAlbums).toEqual(expectedAlbums);
    });

    it("returns only albums with specified tag", function() {
    	var expectedAlbum = new Album("Album1", "Artist1", "Image1", "Link1");

    	bandcamp.setAlbumsForTag("tag1", expectedAlbum);
    	bandcamp.setAlbumsForTag(disusedTag, disusedAlbum);
        sut.updateTags(["tag1", disusedTag]);

    	var actualAlbums = sut.getAlbumsByTags([ "tag1" ]);

    	expect(actualAlbums).toEqual([ expectedAlbum ]);
    });

    it("returns no albums when tag has no albums", function() {
    	var actualAlbums = sut.getAlbumsByTags([ "tag" ]);

    	expect(actualAlbums).toEqual([]);
    });

    it("returns only matching albums when using multiple tags", function() {
    	var expectedAlbum = new Album("Album1", "Artist1", "Image1", "Link1");

    	bandcamp.setAlbumsForTag("tag1", [ expectedAlbum, disusedAlbum ]);
    	bandcamp.setAlbumsForTag("tag2", [ expectedAlbum ]);
        sut.updateTags(["tag1", "tag2"]);

    	var actualAlbums = sut.getAlbumsByTags([ "tag1", "tag2" ]);

    	expect(actualAlbums).toEqual([ expectedAlbum ]);
    });

    it("has cached tag when bandcamp has results for tag", function() {
    	bandcamp.setAlbumsForTag("tag", [ new Album("Album") ]);
        sut.updateTags(["tag"]);

    	expect(sut.hasCached([ "tag" ])).toBe(true);
    });

    it("does not have cached tag when bandcamp has no results for tag", function() {
    	expect(sut.hasCached([ "tag" ])).toBe(false);
    });

    it("only caches tag once when new request asks for tag in progress of update", function(done) {
        bandcamp.delay = 1;

        bandcamp.setAlbumsForTag("tag", [
            new Album("Album"),
            ]);

        sut.updateTags([ "tag" ]);
        sut.updateTags([ "tag" ]);

        setTimeout(function() {
            var actualAlbums = sut.getAlbumsByTags([ "tag" ]);
            expect(bandcamp.tagsRequested.length).toBe(1);
            expect(actualAlbums[0].name).toBe("Album");
            done();
        }, 10);
    });
});