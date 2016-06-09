var server = require("../server/server");
var BandcampFake = require("../server/bandcamp-fake");
var Cache = require("../server/album-cache");
var PopAlbums = require("./albums-pop");
var RockAlbums = require("./albums-rock");
var localRequest = require("./local-request");


describe("Server performance", function() {
    var bandcamp;
    var cache;

    beforeEach(function(done) {
        bandcamp = new BandcampFake(true);
        cache = new Cache(bandcamp);
        server.start(cache, done);
    });

    afterEach(function(done) {
        server.stop(done);
    });

    it("should be fast enough to match two popular tags within a second", function(done) {
    	bandcamp.setAlbumsForTag("pop", PopAlbums);
    	bandcamp.setAlbumsForTag("rock", RockAlbums);
        cache.updateTags(["pop", "rock"]);

    	localRequest([ "pop", "rock" ], function(albums) {
            expect(albums.length).toBe(499);
            done();
        }, function() { done(false); });
    }, 300);
});