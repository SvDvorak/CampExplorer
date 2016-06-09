var server = require("../server/server");
var BandcampFake = require("../server/bandcamp-fake");
var Cache = require("../server/album-cache");
var CacheUpdater = require("../server/cache-updater");
var Album = require("../api-types");
var localRequest = require("./local-request");

var requestShouldNotFail = function(done) { return function(data, error) {
    done.fail("Should not fail to get albums for request.\n" +
        "Error: " + error + "\n" +
        "Data: " + data);
} }

describe("Concurrent server", function() {
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

    it("only caches tag once when new request asks for tag in progress of update", function(done) {
        bandcamp.delay = 1;

        bandcamp.setAlbumsForTag("tag", [
            new Album("Album"),
            ]);

        updater.queueTags(["tag"]);
        updater.queueTags(["tag"]);

        setTimeout(function() {
            localRequest([ "tag" ], function(albums) {
                expect(bandcamp.tagsRequested.length).toBe(1);
                expect(albums[0].name).toBe("Album");
                done();
            }, requestShouldNotFail(done));
        }, 10);
    });

    it("queues up tags to be updated and processes them in order", function(done) {
        bandcamp.delay = 1;

        bandcamp.setAlbumsForTag("tag1", [
            new Album("Album1"),
            ]);

        bandcamp.setAlbumsForTag("tag2", [
            new Album("Album2"),
            ]);

        updater.queueTags(["tag1", "tag2"]);

        expect(updater.queue).toEqual([ "tag1", "tag2" ])

        setTimeout(function() {
	        localRequest([ "tag2" ], function(albums) {
	            expect(albums[0].name).toBe("Album2");
	            done();
	        }, requestShouldNotFail(done));
        }, 20);
    });
});