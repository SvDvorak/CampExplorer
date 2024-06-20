var TestServer = require("./test-server");
var Album = require("../../album-type");
const { localRequest } = require("./local-request");
const { timeout } = require("../../extensions");

describe("Recaching server", () => {
    var testServer;
    var bandcamp;

    let recacheMilliseconds = 15.0;

    beforeEach(async () => {
        testServer = new TestServer();
        bandcamp = testServer.bandcamp;
        bandcamp.delay = 1;
        testServer.config.recacheIntervalInSeconds = recacheMilliseconds/1000.0;
        await testServer.start();
    });

    afterEach(async () => {
        await testServer.stop();
    });

    it("recaches tags when idle", async () => {
        bandcamp.setAlbumsForTag("tag", [ new Album("0", "Album1") ]);

        await localRequest(["tag"]);
        let wait = 40;
        await timeout(wait);
        expect(bandcamp.tagsRequested.length).toBe(Math.floor(wait / recacheMilliseconds));
    });

    it("stops recaching when stopping server", async () => {
        await localRequest(["tag"]);

        await testServer.stop();
        await timeout(70);
        // We can't easily stop the async update loop so it will finish one last update before exiting
        expect(bandcamp.tagsRequested.length).toBe(2);
    });
});