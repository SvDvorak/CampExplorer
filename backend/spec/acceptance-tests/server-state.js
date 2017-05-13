var TestServer = require("./test-server");
var localRequest = require("./local-request");
var stateRequests = require("./server-state-requests");
var moment = require("moment");
require("../test-finished");

describe("Server state", function() {
    var testServer;
    var bandcamp;
    var timeProvider;

    beforeEach(function(done) {
        testServer = new TestServer();
        bandcamp = testServer.bandcamp;
        timeProvider = testServer.timeProvider;
        testServer.start().then(done);
    });

    afterEach(function(done) {
        testServer.stop().then(done);
    });

    it("returns number of currently cached tags", function(done) {
        var expectedTags = [ "funk", "rock", "ambient", "metal", "soundtrack" ];

    	cacheTags(expectedTags)
            .then(() => stateRequests.getCachedTags())
            .then(tagCount => expect(parseInt(tagCount)).toBe(expectedTags.length))
            .testFinished(done);
    });

    it("returns zero cached tags when database has no index or type for tags", function(done) {
        stateRequests.getCachedTags()
            .then(tagCount => expect(parseInt(tagCount)).toBe(0))
            .testFinished(done);
    });

    it("returns number of queued tags", function(done) {
        var expectedQueuedTags = [ "pop", "rock", "ambient", "metal", "soundtrack" ];

        bandcamp.delay = 9999;

    	cacheTags(expectedQueuedTags)
            .then(() => stateRequests.getQueuedTags())
            .then(tagsInQueue => expect(parseInt(tagsInQueue)).toBe(expectedQueuedTags.length))
            .testFinished(done);
    });

    it("returns currently caching tag", function(done) {
        var expectedCachingTag = "pop";

        bandcamp.delay = 9999;

    	cacheTags([ expectedCachingTag ])
            .then(() => stateRequests.getCurrentlyCachingTag())
            .then(cachingTag => expect(cachingTag).toBe(expectedCachingTag))
            .testFinished(done);
    });

    it("returns number of albums cached", function(done) {
        var tag = "pop";

        var expectedAlbums = [ { name: "Album1" }, { name: "Album2" }, { name: "Album3" }];
        bandcamp.setAlbumsForTag(tag, expectedAlbums);

        cacheTags([ tag ])
            .then(() => stateRequests.getAlbumCount())
            .then(albumCount => expect(albumCount).toBe(expectedAlbums.length))
            .testFinished(done);
    });

    it("returns zero as album count when database has no index or type for tags", function(done) {
        stateRequests.getAlbumCount()
            .then(albumCount => expect(albumCount).toBe(0))
            .testFinished(done);
    });

    it("returns number of requests performed in last 5 minutes", function(done) {
        cacheAtTimeInMinutes(10)
            .then(() => cacheAtTimeInMinutes(7))
            .then(() => cacheAtTimeInMinutes(4))
            .then(() => cacheAtTimeInMinutes(4))
            .then(() => stateRequests.getRequestRate())
            .then(requests => expect(requests).toBe(2))
            .testFinished(done);
    });

    var cacheAtTimeInMinutes = function(minutes) {
        timeProvider.setTime(moment().subtract(minutes, "minutes"));
        return localRequest([ "tag" ])
    };

    var cacheTags = function(tags) {
    	return localRequest(tags);
    };
});
