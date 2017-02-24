var Cache = require("../source/album-cache");
var Album = require("../source/api-types");

describe("Album cache", function() {
	var sut;
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

    it("returns uncached for tags not already cached", function() {
    	expect(sut.filterUncached([ "tag" ])).toEqual([ "tag" ]);
    });

    it("returns empty when all tags are cached", function() {
        setAlbumsForTag("tag", [ new Album("Album") ]);

        expect(sut.filterUncached([ "tag" ])).toEqual([ ]);
    });
});