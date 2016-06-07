var server = require("../server/server");
var BandcampFake = require("../server/bandcamp-fake");
var Cache = require("../server/album-cache");
var Album = require("../api-types");
var localRequest = require("./local-request");

describe("Server with cache", function() {
    beforeEach(function(done) {
        bandcamp = new BandcampFake();
        var cache = new Cache(bandcamp);
        server.start(cache, done);
    });

    afterEach(function(done) {
        server.stop(done);
    });

    it("returns complete album", function(done) {
        var album = new Album(
            "Album name",
            "Artist name",
            "www.imagelink.com",
            "www.albumlink.com");

        bandcamp.setAlbumsForTag("tag", [ album ]);

        localRequest([ "tag" ], function(albums) {
            expect(albums.length).toBe(1);
            var singleAlbum = albums[0];
            expect(singleAlbum.name).toBe("Album name");
            expect(singleAlbum.artist).toBe("Artist name");
            expect(singleAlbum.image).toBe("www.imagelink.com");
            expect(singleAlbum.link).toBe("www.albumlink.com");
            done();
        }, function() { done(false); });
    });

    it("returns albums with all requested tags", function(done) {

        bandcamp.setAlbumsForTag("tag1", [
            linkOnlyAlbum("AllTagsAlbum"),
            linkOnlyAlbum("SingleTagAlbum")
            ]);

        bandcamp.setAlbumsForTag("tag2", [
            linkOnlyAlbum("AllTagsAlbum"),
            ]);


        localRequest([ "tag1", "tag2" ], function(albums) {
            expect(albums.length).toBe(1);
            expect(albums[0].link).toBe("AllTagsAlbum");
            done();
        }, function() { done(false); });

    });

    it("returns tags format incorrect when tags malformed", function(done) {
        localRequest({ },
            function() { done() },
            function() { done(false) })
    }, 1000);

    var linkOnlyAlbum = function(linkText) {
        return new Album("", "", "", linkText);
    }
});
