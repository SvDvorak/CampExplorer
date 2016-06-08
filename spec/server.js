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
        }, function() { done.fail("Should not fail to get albums for request"); });
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
        }, function() { done.fail("Should not fail to get albums for request"); });
    });

    it("returns tags format incorrect when tags malformed", function(done) {
        localRequest({ },
            function() { done.fail("Request with malformed data should not return successfully"); },
            function(error, status) {
                expect(status).toBe(400);
                expect(error).toBe("Unable to parse request data");
                done();
            });
    });

    it("returns tag not cached when requested uncached tag", function(done) {
        localRequest(
            [ "tag" ],
            function(data) { done.fail("Request for uncached tag should return as error"); },
            function(error, status) {
                expect(status).toBe(400);
                expect(error).toBe("Tag not cached, try again later");
                done();
            });
    });

    var linkOnlyAlbum = function(linkText) {
        return new Album("", "", "", linkText);
    }
});
