var TestServer = require("./test-server");
const { localRequest } = require("./local-request");
var stateRequests = require("./server-state-requests");
const { timeout } = require("../../extensions");
var moment = require("moment");
var Config = require("./config");

describe("Server state", () => {
    var testServer;
    var bandcamp;
    var database;
    var timeProvider;

    beforeEach(async () => {
        var config = new Config();
        config.albumRecacheIntervalInSeconds = 0.5;
        testServer = new TestServer(config);
        bandcamp = testServer.bandcamp;
        database = testServer.database;
        timeProvider = testServer.timeProvider;
        await testServer.start();
    });

    afterEach(async () => {
        await testServer.stop();
    });

    it("returns number of currently cached tags", async () => {
        const expectedTags = [ "funk", "rock", "ambient", "metal", "soundtrack" ];

    	await cacheTags(expectedTags);
        // We async loop through all queued tags so we gotta wait a little bit for it to finish
        await timeout(20);
        const tagCount = await stateRequests.getCachedTags();
        expect(parseInt(tagCount)).toBe(expectedTags.length);
    });

    it("returns zero cached tags when database has no index or type for tags", async () => {
        const tagCount = await stateRequests.getCachedTags();
        expect(parseInt(tagCount)).toBe(0);
    });

    it("returns number of queued tags", async () => {
        var expectedQueuedTags = [ "pop", "rock", "ambient", "metal", "soundtrack" ];

        bandcamp.delay = 9999;

    	await cacheTags(expectedQueuedTags)
        const operationsInQueue = await stateRequests.getQueuedOperations();
        expect(parseInt(operationsInQueue)).toBe(expectedQueuedTags.length);
    });

    it("returns currently caching operation", async () => {
        var expectedCachingTag = "pop";

        bandcamp.delay = 9999;

    	await cacheTags([ expectedCachingTag ]);
        const cachingTag = await stateRequests.getCurrentlyCaching();
        expect(cachingTag).toBe("T: " + expectedCachingTag);
    });

    it("returns number of albums cached", async () => {
        var tag = "pop";

        var expectedAlbums = [ { name: "Album1" }, { name: "Album2" }, { name: "Album3" }];
        bandcamp.setAlbumsForTag(tag, expectedAlbums);

        await cacheTags([ tag ]);
        const albumCount = await stateRequests.getAlbumCount();
        expect(albumCount).toBe(expectedAlbums.length);
    });

    it("returns number of albums cached without updated tags", async () => {
        var tag = "pop";
        var expectedAlbums = [ { name: "Album1" }, { name: "Album2" }, { name: "Album3" }];
        database.saveTagAlbums(tag, expectedAlbums);

        await timeout(500);

        const albumCount = await stateRequests.getAlbumCountWithoutUpdatedTags();
        expect(albumCount).toBe(2);
    });

    it("returns zero as album count when database has no index or type for tags", async () => {
        const albumCount = await stateRequests.getAlbumCount()
        expect(albumCount).toBe(0);
    });

    it("returns number of requests performed in number of hours", async () => {
        await cacheAtTimeInHours(5);
        await cacheAtTimeInHours(4);
        await cacheAtTimeInHours(0.7);
        await cacheAtTimeInHours(0.5);
        const requests = await stateRequests.getRequestRate(1);
        expect(requests).toBe(2);
    });

    it("only keeps last 24 hours in request history", async () => {
        await cacheAtTimeInHours(30)
        await cacheAtTimeInHours(29);
        await cacheAtTimeInHours(23);
        await cacheAtTimeInHours(20);
        const requests = await stateRequests.getRequestRate(30);
        expect(requests).toBe(2);
    });

    var cacheAtTimeInHours = function(hours) {
        timeProvider.setTime(moment().subtract(hours, "hours"));
        return localRequest([ "tag" ])
    };

    var cacheTags = function(tags) {
    	return localRequest(tags);
    };
});
