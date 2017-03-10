var TestServer = require("./test-server");
var localRequest = require("./local-request");
var stateRequests = require("./server-state-requests");
require("../test-finished");

describe("Server state", function() {
    var testServer;
    var bandcamp;

    beforeEach(function(done) {
        testServer = new TestServer();
        bandcamp = testServer.bandcamp;
        testServer.start().then(done);
    });

    afterEach(function(done) {
        testServer.stop().then(done);
    });

    it("returns all currently cached tags", function(done) {
        var expectedTags = [ "pop", "rock", "ambient", "metal", "soundtrack" ];

    	cacheTags(expectedTags)
            .then(() => stateRequests.getCachedTags())
            .then(tagCount => expect(parseInt(tagCount)).toBe(expectedTags.length))
            .testFinished(done);
    });

    it("returns all queued tags", function(done) {
        var expectedTags = [ "pop", "rock", "ambient", "metal", "soundtrack" ];

        bandcamp.delay = 9999;

    	cacheTags(expectedTags)
            .then(() => stateRequests.getQueuedTags())
            .then(tagCount => expect(parseInt(tagCount)).toBe(expectedTags.length))
            .testFinished(done);
    });

    var cacheTags = function(tags) {
    	return localRequest(tags);
    }
});
