var TestServer = require("./test-server");
var Album = require("../../album-type");
const { localRequest } = require("./local-request");
const { timeout } = require("../../extensions");

describe("Album recaching server", () => {
    var testServer;
    var bandcamp;
    var database;

    let recacheMilliseconds = 15.0;

    beforeEach(async () => {
        testServer = new TestServer();
        bandcamp = testServer.bandcamp;
        bandcamp.delay = 1;
        database = testServer.database;
        testServer.config.tagRecacheIntervalInSeconds = 99999;
        testServer.config.albumRecacheIntervalInSeconds = recacheMilliseconds/1000.0;
        await testServer.start();
    });

    afterEach(async () => {
        await testServer.stop();
    });

    it("recaches album tags when idle", async () => {
        var album = new Album("1", "Album1");
        var tags = ["tag1", "tag2", "tag3"];
        bandcamp.setAlbumsForTag(tags[0], [ album ]);
        bandcamp.setTagsForAlbum(album, tags);

        await localRequest(["tag1"]);
        let wait = 40;
        await timeout(wait);
        expect(database.saveAlbumCalls.length).toBe(1);
        expect(database.saveAlbumCalls[0].album).toBe(album);
        expect(database.saveAlbumCalls[0].tags).toBe(tags);
    });

    it("stops recaching when stopping server", async () => {
        var albums = [
            new Album("1", "Album1"),
            new Album("2", "Album2"),
            new Album("3", "Album3")
        ]
        var tags = ["tag1", "tag2", "tag3"];
        bandcamp.setAlbumsForTag(tags[0], [ albums[0] ]);
        bandcamp.setTagsForAlbum(albums[0], tags);
        bandcamp.setTagsForAlbum(albums[1], tags);
        bandcamp.setTagsForAlbum(albums[2], tags);

        await localRequest(["tag1"]);

        await testServer.stop();
        await timeout(70);
        expect(bandcamp.albumsRequested.length).toBe(1);
    });
});