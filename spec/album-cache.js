var Cache = require("../server/album-cache");
var BandcampFake = require("../server/bandcamp-fake");
var Album = require("../api-types");

describe("Album cache", function() {
	var sut;
	var bandcamp;
	var disusedAlbum;
	var disusedTag

    beforeEach(function() {
    	sut = new Cache();
    	disusedAlbum = new Album("Album2", "Artist2", "Image2", "Link2");
    	disusedTag = "deadtag";
    });

    var setAlbumsForTag = function(tag, albums) {
        sut.albums[tag] = albums;
    }

    it("returns albums matching single tag", function() {
    	var expectedAlbums =
	    	[
		    	new Album("Album1", "Artist1", "Image1", "Link1"),
		    	new Album("Album2", "Artist2", "Image2", "Link2")
	    	];

    	setAlbumsForTag("tag", expectedAlbums);

    	var actualAlbums = sut.getAlbumsByTags([ "tag" ]);

    	expect(actualAlbums).toEqual(expectedAlbums);
    });

    it("returns only albums with specified tag", function() {
    	var expectedAlbum = new Album("Album1", "Artist1", "Image1", "Link1");

        setAlbumsForTag("tag1", [ expectedAlbum ]);
        setAlbumsForTag(disusedTag, [ disusedAlbum ]);

    	var actualAlbums = sut.getAlbumsByTags([ "tag1" ]);

    	expect(actualAlbums).toEqual([ expectedAlbum ]);
    });

    it("returns no albums when tag has no albums", function() {
    	var actualAlbums = sut.getAlbumsByTags([ "tag" ]);

    	expect(actualAlbums).toEqual([]);
    });

    it("returns only matching albums when using multiple tags", function() {
    	var expectedAlbum = new Album("Album1", "Artist1", "Image1", "Link1");

        setAlbumsForTag("tag1", [ expectedAlbum, disusedAlbum ]);
        setAlbumsForTag("tag2", [ expectedAlbum ]);

    	var actualAlbums = sut.getAlbumsByTags([ "tag1", "tag2" ]);

    	expect(actualAlbums).toEqual([ expectedAlbum ]);
    });

    it("has cached tag when bandcamp has results for tag", function() {
        setAlbumsForTag("tag", [ new Album("Album") ]);

    	expect(sut.hasCached([ "tag" ])).toBe(true);
    });

    it("does not have cached tag when bandcamp has no results for tag", function() {
    	expect(sut.hasCached([ "tag" ])).toBe(false);
    });
});