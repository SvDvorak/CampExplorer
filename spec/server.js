var server = require("../server/server");
var BandcampFake = require("../server/bandcamp-fake");
var Cache = require("../server/album-cache");
var CacheUpdater = require("../server/cache-updater");
var Album = require("../api-types");
var localRequest = require("./local-request");

var requestShouldNotFail = function(done) { return function(data, error) {
    done.fail("Should not fail to get albums for request.\n" +
        "Error: " + error + "\n" +
        "Data: " + data);
} }

describe("Server with cache", function() {
    var bandcamp;
    var cache;
    var updater;

    beforeEach(function(done) {
        bandcamp = new BandcampFake();
        cache = new Cache();
        updater = new CacheUpdater(cache, bandcamp);
        server.start(cache, updater, done);
    });

    afterEach(function(done) {
        server.stop(done);
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
        updater.queueTags(["tag"]);

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

        updater.queueTags(["tag1", "tag2"]);

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
                expect(status).toBe(400);
                expect(errorData.error).toBe("Tags not cached, try again later");
                expect(errorData.code).toBe("NOT_CACHED");
                expect(errorData.data).toEqual([ "musicTag" ]);
                done();
            });

        localRequest([ "musicTag" ], function(albums) {
            expect(albums[0].link).toBe("Album");
            done();
        }, requestShouldNotFail(done));
    });

    var linkOnlyAlbum = function(linkText) {
        var album = new Album();
        album.link = linkText;
        return album;
    }
});