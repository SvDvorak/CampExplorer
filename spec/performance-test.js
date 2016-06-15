var TestServer = require("./test-server");
var PopAlbums = require("./albums-pop");
var RockAlbums = require("./albums-rock");
var localRequest = require("./local-request");

describe("Server performance", function() {
    var testServer;
    var bandcamp;

    beforeEach(function(done) {
        testServer = new TestServer();
        bandcamp = testServer.bandcamp;
        testServer.start(done);
    });

    afterEach(function(done) {
        testServer.stop(done);
    });

    it("should be fast enough to match two popular tags within a second", function(done) {
    	bandcamp.setAlbumsForTag("pop", PopAlbums);
    	bandcamp.setAlbumsForTag("rock", RockAlbums);

    	localRequest([ "pop", "rock" ], function(albums) {
            expect(albums.length).toBe(50);
            done();
        }, function() { done(false); });
    }, 100);
});