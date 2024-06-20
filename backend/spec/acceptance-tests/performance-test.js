var TestServer = require("./test-server");
var PopAlbums = require("./albums-pop");
var RockAlbums = require("./albums-rock");
const { localRequest, localCacheRequest } = require("./local-request");

describe("Server performance", () => {
    var testServer;
    var bandcamp;

    beforeEach(async () => {
        testServer = new TestServer();
        bandcamp = testServer.bandcamp;
        await testServer.start();
    });

    afterEach(async () => {
        await testServer.stop();
    });

    it("should be fast enough to match two popular tags within a tenth of a second", async () => {
    	bandcamp.setAlbumsForTag("pop", PopAlbums);
    	bandcamp.setAlbumsForTag("rock", RockAlbums);

        var startTime = undefined;
        var expectedResultCount = 90;
        var maxCallTime = 100;

        // Cache them once first
    	await localCacheRequest([ "pop", "rock" ]);
        startTime = new Date();
        const albums = await localRequest([ "pop", "rock" ]);
        expect(albums.length).toBe(expectedResultCount)
        expect(startTime - new Date()).toBeLessThan(maxCallTime);
    });
});