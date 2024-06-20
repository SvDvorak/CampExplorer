var TestServer = require("./test-server");
var Album = require("../../album-type");
const { localRequest, localCacheRequest } = require("./local-request");
const { timeout } = require("../../extensions");

describe("Concurrent tag caching server", () => {
    var testServer;
    var bandcamp;
    var persister;

    beforeEach(async () => {
        testServer = new TestServer();
        bandcamp = testServer.bandcamp;
        bandcamp.delay = 1;
        persister = testServer.persister;
    });

    afterEach(async () => {
        testServer.stop();
    });

    it("only caches tag once when new request asks for tag in progress of update", async () => {
        bandcamp.setAlbumsForTag("tag", [ new Album("0", "Album") ]);

        await testServer.start();
        await localRequest(["tag"]);
        await localRequest(["tag"]);
        await timeout(70);
        const albums = await localRequest(["tag"]);
        expect(bandcamp.tagsRequested.length).toBe(1);
        expect(albums[0].name).toBe("Album");
    });

    it("queues up tags to be updated and processes them in order", async () => {
        bandcamp.setAlbumsForTag("tag1", [ new Album("0", "Album1") ]);
        bandcamp.setAlbumsForTag("tag2", [ new Album("1", "Album2") ]);

        await testServer.start()
        const response = await localRequest(["tag1", "tag2"]);
        expect(response.data).toEqual([ "tag1", "tag2" ]);

        await timeout(70);
        expect(bandcamp.tagsRequested).toEqual([ "tag1", "tag2" ]);
        const albums = await localRequest([ "tag2" ]);
        expect(albums[0].name).toBe("Album2");
    });

    it("uses seeder when config has seed set", async () => {
        testServer.config.startSeed = "tag";

        var album1 = new Album("0", "Album1");
        var album2 = new Album("1", "Album2");
        bandcamp.setAlbumsForTag("tag", [ album1 ]);
        bandcamp.setAlbumsForTag("tag_sub1", [ album2 ]);
        bandcamp.setTagsForAlbum(album1, [ "tag_sub1" ]);

        await testServer.start();
        await localCacheRequest(["tag_sub1"]);
        const albums = await localRequest(["tag_sub1"]);
        expect(albums.length).toBe(1);
        expect(albums[0].name).toEqual(album2.name);
    });
});
