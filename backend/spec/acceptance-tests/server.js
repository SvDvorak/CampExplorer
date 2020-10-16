var TestServer = require("./test-server");
var Album = require("../../api-types");
var localRequest = require("./local-request");
var generateAlbums = require("../generate-albums");
require("../test-finished");

describe("Server with cache", function() {
    var testServer;
    var bandcamp;
    var database;

    beforeEach(async () => {
        testServer = new TestServer();
        bandcamp = testServer.bandcamp;
        database = testServer.database;
        await testServer.start();
    });

    afterEach(async () => {
        await testServer.stop();
    });

    it("returns complete album", async () => {
        var album = new Album(
            "987654321",
            "Album name",
            "Artist name",
            "www.imagelink.com",
            "www.albumlink.com",
            "123456789");

        bandcamp.setAlbumsForTag("tag", [ album ]);

        await localRequest(["tag"]);
        const albums = await localRequest([ "tag" ]);

        expect(albums.length).toBe(1);
        var singleAlbum = albums[0];
        expect(singleAlbum.id).toBe("987654321");
        expect(singleAlbum.name).toBe("Album name");
        expect(singleAlbum.artist).toBe("Artist name");
        expect(singleAlbum.image).toBe("www.imagelink.com");
        expect(singleAlbum.link).toBe("www.albumlink.com");
        expect(singleAlbum.bandId).toBe("123456789");
    });

    it("returns albums with all requested tags", async () => {
        bandcamp.setAlbumsForTag("tag1", [
            linkOnlyAlbum("AllTagsAlbum"),
            linkOnlyAlbum("SingleTagAlbum")
            ]);

        bandcamp.setAlbumsForTag("tag2", [
            linkOnlyAlbum("AllTagsAlbum"),
            ]);

        await localRequest(["tag1", "tag2"])
        const albums = await localRequest([ "tag1", "tag2" ]);

        expect(albums.length).toBe(1);
        expect(albums[0].link).toBe("AllTagsAlbum");
    });

    it("returns tags format incorrect when tags malformed", async () => {
        bandcamp.setAlbumsForTag("tag", [ linkOnlyAlbum("Album") ]);

        try {
            await localRequest();
            throw "Request with malformed data should not return successfully";
        }
        catch(e) {
            expect(e.statusCode).toBe(400);
            expect(JSON.parse(e.error).error).toBe("Unable to parse request data");
        }
    });

    it("returns tag not cached when requesting uncached tag, caches and returns tag albums on subsequent request", async () => {
        bandcamp.setAlbumsForTag("musictag", [
            linkOnlyAlbum("Album")
            ]);

        const response = await localRequest([ "musicTag" ]);
        expect(response.error).toBe("Tags not loaded, try again later");
        expect(response.data).toEqual([ "musictag" ]);
        const albums = await localRequest([ "musicTag" ]);
        expect(albums[0].link).toBe("Album");
    });

    it("returns a maximum of 90 albums", async () => {
        bandcamp.setAlbumsForTag("tag", generateAlbums(500));
        await localRequest([ "tag" ]);
        const albums = await localRequest([ "tag" ]);
        expect(albums.length).toBe(90);
    });

    it("limits request to 10 tags", async () => {
        var tags = [...Array(11).keys()].map(x => "tag" + x);

        await localRequest(tags);
        expect(bandcamp.tagsRequested).toEqual(tags.slice(0, 10));
    });

    it("lower cases all tag parameters before use", async () => {
        bandcamp.setAlbumsForTag("tag", [ linkOnlyAlbum("Album") ]);

        await localRequest(["TAG"]);
        const albums = await localRequest([ "TAG" ]);
        expect(albums.length).toBe(1);
    });

    it("returns empty result without using database when calling without tags", async () => {
        const albums = await localRequest([ ])
        expect(albums.length).toBe(0);
        expect(database.getAlbumsCalls.length).toBe(0);
    });

    var linkOnlyAlbum = function(linkText) {
        var album = new Album();
        album.link = linkText;
        return album;
    }
});