var TestServer = require("./test-server");
var Album = require("../../source/api-types");
var localRequest = require("./local-request");
var generateAlbums = require("../generate-albums");
var removeCache = require("./remove-cache");
require("../test-finished");

describe("Server with cache", function() {
    var testServer;
    var bandcamp;

    beforeEach(function(done) {
        testServer = new TestServer();
        removeCache(testServer.config.persistPath);
        bandcamp = testServer.bandcamp;
        testServer.start().then(done);
    });

    afterEach(function(done) {
        testServer.stop().then(done);
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

        localRequest(["tag"])
            .then(() => localRequest([ "tag" ]))
            .then(albums => {
                expect(albums.length).toBe(1);
                var singleAlbum = albums[0];
                expect(singleAlbum.name).toBe("Album name");
                expect(singleAlbum.artist).toBe("Artist name");
                expect(singleAlbum.image).toBe("www.imagelink.com");
                expect(singleAlbum.link).toBe("www.albumlink.com");
                expect(singleAlbum.bandId).toBe("123456789");
                expect(singleAlbum.albumId).toBe("987654321");
            })
            .testFinished(done);
    });

    it("returns albums with all requested tags", function(done) {
        bandcamp.setAlbumsForTag("tag1", [
            linkOnlyAlbum("AllTagsAlbum"),
            linkOnlyAlbum("SingleTagAlbum")
            ]);

        bandcamp.setAlbumsForTag("tag2", [
            linkOnlyAlbum("AllTagsAlbum"),
            ]);

        localRequest(["tag1", "tag2"])
            .then(() => localRequest([ "tag1", "tag2" ]))
            .then(albums => {
                expect(albums.length).toBe(1);
                expect(albums[0].link).toBe("AllTagsAlbum");
            })
            .testFinished(done);
    });

    it("returns tags format incorrect when tags malformed", function(done) {
        bandcamp.setAlbumsForTag("tag", [ linkOnlyAlbum("Album") ]);


        localRequest()
            .then(() => done.fail("Request with malformed data should not return successfully"))
            .catch(data => {
                expect(data.statusCode).toBe(400);
                expect(JSON.parse(data.error).error).toBe("Unable to parse request data");
            })
            .testFinished(done);
    });

    it("returns tag not cached when requesting uncached tag, caches and returns tag albums on subsequent request", function(done) {
        bandcamp.setAlbumsForTag("musicTag", [
            linkOnlyAlbum("Album")
            ]);

        localRequest([ "musicTag" ])
            .then(response => {
                expect(response.error).toBe("Tags not cached, try again later");
                expect(response.data).toEqual([ "musicTag" ]);
            })
            .then(() => localRequest([ "musicTag" ]))
            .then(albums => expect(albums[0].link).toBe("Album"))
            .testFinished(done);
    });

    it("returns a maximum of 50 albums", function(done) {
        var albums = generateAlbums(500)

        bandcamp.setAlbumsForTag("tag", albums);
        localRequest([ "tag" ])
            .then(() => localRequest([ "tag" ]))
            .then(albums => expect(albums.length).toBe(50))
            .testFinished(done);
    });

    var linkOnlyAlbum = function(linkText) {
        var album = new Album();
        album.link = linkText;
        return album;
    }
});