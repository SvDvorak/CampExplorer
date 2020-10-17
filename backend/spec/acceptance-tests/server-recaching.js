var TestServer = require("./test-server");
var Album = require("../../api-types");
var localRequest = require("./local-request");
const { timeout } = require("../../extensions");
require("../test-finished");

describe("Recaching server", () => {
    var testServer;
    var bandcamp;

    beforeEach(async () => {
        testServer = new TestServer();
        bandcamp = testServer.bandcamp;
        bandcamp.delay = 1;
        testServer.config.recacheIntervalInSeconds = 15.0/1000.0;
        await testServer.start();
    });

    afterEach(async () => {
        await testServer.stop();
    });

    it("recaches tags when idle", async () => {
        bandcamp.setAlbumsForTag("tag", [ new Album("0", "Album1") ]);

        await localRequest(["tag"]);
        await timeout(40);
        expect(bandcamp.tagsRequested.length).toBe(2);
    });

    it("stops recaching when stopping server", async () => {
        await localRequest(["tag"]);
        await testServer.stop();
        await timeout(70);
        expect(bandcamp.tagsRequested.length).toBe(1);
    });
});