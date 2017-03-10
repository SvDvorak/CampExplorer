var TestServer = require("./test-server");
var localRequest = require("./local-request");
var debugRequests = require("./debug-requests");
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
            .then(() => debugRequests())
            .then(tagCount => expect(parseInt(tagCount)).toBe(expectedTags.length))
            .testFinished(done);
    });

    var cacheTags = function(tags) {
    	return localRequest(tags);
    }
});
