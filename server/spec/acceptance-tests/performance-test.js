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
        testServer.start(done);
    });

    afterEach(function(done) {
        testServer.stop(done);
    });

    it("should be fast enough to match two popular tags within a tenth of a second", function(done) {
    	bandcamp.setAlbumsForTag("pop", PopAlbums);
    	bandcamp.setAlbumsForTag("rock", RockAlbums);

    	localRequest([ "pop", "rock" ]);

        localRequest([ "pop", "rock" ], function(albums) {
            expect(albums.length).toBe(50);
            done();
        }, function() { done.fail("performance not fast enough"); });
    }, 100);
});