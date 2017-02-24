var TestServer = require("./test-server");
var Album = require("../../api-types");
var localRequest = require("./local-request");
var requestShouldNotFail = require("./request-should-not-fail");
var generateAlbums = require("../generate-albums");
var removeCache = require("./remove-cache");

describe("Server with cache", function() {
    var testServer;
    var bandcamp;

    beforeEach(function(done) {
        testServer = new TestServer();
        removeCache(testServer.config.persistPath);
        bandcamp = testServer.bandcamp;
        testServer.start(done);
    });

    afterEach(function(done) {
        testServer.stop(done);
    });

    it("returns complete album", function(done) {
        var album = new Album(
            "Album name",
            "Artist name",
            "www.imagelink.com",
            "www.albumlink.com",
            "123456789",
            "987654321");

        bandcamp.setAlbumsForTag("tag", [ album ]);
        localRequest(["tag"]);

        localRequest([ "tag" ], function(albums) {
            expect(albums.length).toBe(1);
            var singleAlbum = albums[0];
            expect(singleAlbum.name).toBe("Album name");
            expect(singleAlbum.artist).toBe("Artist name");
            expect(singleAlbum.image).toBe("www.imagelink.com");
            expect(singleAlbum.link).toBe("www.albumlink.com");
            expect(singleAlbum.bandId).toBe("123456789");
            expect(singleAlbum.albumId).toBe("987654321");
            done();
        }, requestShouldNotFail(done));
    });

    it("returns albums with all requested tags", function(done) {
        bandcamp.setAlbumsForTag("tag1", [
            linkOnlyAlbum("AllTagsAlbum"),
            linkOnlyAlbum("SingleTagAlbum")
            ]);

        bandcamp.setAlbumsForTag("tag2", [
            linkOnlyAlbum("AllTagsAlbum"),
            ]);

        localRequest(["tag1", "tag2"]);

        localRequest([ "tag1", "tag2" ], function(albums) {
            expect(albums.length).toBe(1);
            expect(albums[0].link).toBe("AllTagsAlbum");
            done();
        }, requestShouldNotFail(done));
    });

    it("returns tags format incorrect when tags malformed", function(done) {
        bandcamp.setAlbumsForTag("tag", [
            linkOnlyAlbum("Album")
            ]);


        localRequest({ },
            function() { done.fail("Request with malformed data should not return successfully"); },
            function(data, status) {
                expect(status).toBe(400);
                expect(data.error).toBe("Unable to parse request data");
                done();
            });
    });

    it("returns tag not cached when requesting uncached tag, caches and returns tag albums on subsequent request", function(done) {
        bandcamp.setAlbumsForTag("musicTag", [
            linkOnlyAlbum("Album")
            ]);

        localRequest([ "musicTag" ],
            function(data) { done.fail("Request for uncached tag should return as error"); },
            function(errorData, status) {
                expect(status).toBe(202);
                expect(errorData.error).toBe("Tags not cached, try again later");
                expect(errorData.data).toEqual([ "musicTag" ]);
            });

        localRequest([ "musicTag" ], function(albums) {
            expect(albums[0].link).toBe("Album");
            done();
        }, requestShouldNotFail(done));
    });

    it("returns a maximum of 50 albums", function(done) {
        var albums = generateAlbums(500)

        bandcamp.setAlbumsForTag("tag", albums);
        localRequest([ "tag" ]);

        localRequest([ "tag" ], function(albums) {
            expect(albums.length).toBe(50);
            done();
        }, requestShouldNotFail(done));
    });

    var linkOnlyAlbum = function(linkText) {
        var album = new Album();
        album.link = linkText;
        return album;
    }
});