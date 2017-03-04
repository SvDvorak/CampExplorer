var TestServer = require("./test-server");
var PopAlbums = require("./albums-pop");
var RockAlbums = require("./albums-rock");
var localRequest = require("./local-request");
var removeCache = require("./remove-cache");

describe("Server performance", function() {
    var testServer;
    var bandcamp;

    beforeEach(function(done) {
        testServer = new TestServer();
        removeCache(testServer.config.persistPath);
        bandcamp = testServer.bandcamp;
        testServer.start().then(done);
    });

    afterEach(function(done) {
        testServer.stop().then(done);
    });

    it("should be fast enough to match two popular tags within a tenth of a second", function(done) {
    	bandcamp.setAlbumsForTag("pop", PopAlbums);
    	bandcamp.setAlbumsForTag("rock", RockAlbums);

        var startTime = undefined;
        var expectedResultCount = 50;
        var maxCallTime = 100;

        // Cache them once first
    	localRequest([ "pop", "rock" ])
            .then(() => startTime = new Date())
            .then(() => localRequest([ "pop", "rock" ]))
            .then(albums => {
                expect(albums.length).toBe(expectedResultCount)
                expect(startTime - new Date()).toBeLessThan(maxCallTime);
            })
            .then(done)
            .catch(error => done.fail(error));
    });
});