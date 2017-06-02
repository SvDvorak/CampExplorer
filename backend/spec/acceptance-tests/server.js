var TestServer = require("./test-server");
var Album = require("../../api-types");
var localRequest = require("./local-request");
var generateAlbums = require("../generate-albums");
require("../test-finished");

describe("Server with cache", function() {
    var testServer;
    var bandcamp;
    var database;

    beforeEach(function(done) {
        testServer = new TestServer();
        bandcamp = testServer.bandcamp;
        database = testServer.database;
        testServer.start().then(done);
    });

    afterEach(function(done) {
        testServer.stop().then(done);
    });

    it("returns complete album", function(done) {
        var album = new Album(
            "987654321",
            "Album name",
            "Artist name",
            "www.imagelink.com",
            "www.albumlink.com",
            "123456789");

        bandcamp.setAlbumsForTag("tag", [ album ]);

        localRequest(["tag"])
            .then(() => localRequest([ "tag" ]))
            .then(albums => {
                expect(albums.length).toBe(1);
                var singleAlbum = albums[0];
                expect(singleAlbum.id).toBe("987654321");
                expect(singleAlbum.name).toBe("Album name");
                expect(singleAlbum.artist).toBe("Artist name");
                expect(singleAlbum.image).toBe("www.imagelink.com");
                expect(singleAlbum.link).toBe("www.albumlink.com");
                expect(singleAlbum.bandId).toBe("123456789");
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
        bandcamp.setAlbumsForTag("musictag", [
            linkOnlyAlbum("Album")
            ]);

        localRequest([ "musicTag" ])
            .then(response => {
                expect(response.error).toBe("Tags not loaded, try again later");
                expect(response.data).toEqual([ "musictag" ]);
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

    it("limits request to 10 tags", function(done) {
        var tags = [...Array(11).keys()].map(x => "tag" + x);

        localRequest(tags)
            .then(() => expect(bandcamp.tagsRequested).toEqual(tags.slice(0, 10)))
            .testFinished(done);
    });

    it("lower cases all tag parameters before use", function(done) {
        bandcamp.setAlbumsForTag("tag", [ linkOnlyAlbum("Album") ]);

        localRequest(["TAG"])
            .then(() => localRequest([ "TAG" ]))
            .then(albums => expect(albums.length).toBe(1))
            .testFinished(done);
    });

    it("returns empty result without using database when calling without tags", function(done) {
        localRequest([ ])
            .then(albums => {
                expect(albums.length).toBe(0);
                expect(database.getAlbumsCalls.length).toBe(0);
            })
            .testFinished(done);
    });

    var linkOnlyAlbum = function(linkText) {
        var album = new Album();
        album.link = linkText;
        return album;
    }
});