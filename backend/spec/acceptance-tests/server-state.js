var TestServer = require("./test-server");
var localRequest = require("./local-request");
var stateRequests = require("./server-state-requests");
const { timeout } = require("../../extensions");
var moment = require("moment");
require("../test-finished");

describe("Server state", () => {
    var testServer;
    var bandcamp;
    var timeProvider;

    beforeEach(async () => {
        testServer = new TestServer();
        bandcamp = testServer.bandcamp;
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
        const tagsInQueue = await stateRequests.getQueuedTags();
        expect(parseInt(tagsInQueue)).toBe(expectedQueuedTags.length);
    });

    it("returns currently caching tag", async () => {
        var expectedCachingTag = "pop";

        bandcamp.delay = 9999;

    	await cacheTags([ expectedCachingTag ]);
        const cachingTag = await stateRequests.getCurrentlyCachingTag();
        expect(cachingTag).toBe(expectedCachingTag);
    });

    it("returns number of albums cached", async () => {
        var tag = "pop";

        var expectedAlbums = [ { name: "Album1" }, { name: "Album2" }, { name: "Album3" }];
        bandcamp.setAlbumsForTag(tag, expectedAlbums);

        await cacheTags([ tag ])
        const albumCount = await stateRequests.getAlbumCount();
        expect(albumCount).toBe(expectedAlbums.length);
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
