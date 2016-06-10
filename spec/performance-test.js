var server = require("../server/server");
var BandcampFake = require("../server/bandcamp-fake");
var Cache = require("../server/album-cache");
var CacheUpdater = require("../server/cache-updater");
var PopAlbums = require("./albums-pop");
var RockAlbums = require("./albums-rock");
var localRequest = require("./local-request");


describe("Server performance", function() {
    var bandcamp;
    var cache;
    var updater;

    beforeEach(function(done) {
        bandcamp = new BandcampFake();
        cache = new Cache();
        updater = new CacheUpdater(cache, bandcamp);
        server.start(cache, updater, done);
    });

    afterEach(function(done) {
        server.stop(done);
    });

    it("should be fast enough to match two popular tags within a second", function(done) {
    	bandcamp.setAlbumsForTag("pop", PopAlbums);
    	bandcamp.setAlbumsForTag("rock", RockAlbums);
        updater.queueTags(["pop", "rock"]);

    	localRequest([ "pop", "rock" ], function(albums) {
            expect(albums.length).toBe(50);
            done();
        }, function() { done(false); });
    }, 300);
});