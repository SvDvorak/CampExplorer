var server = require("../server/server");
var BandcampFake = require("./bandcamp-fake");
var Cache = require("../server/album-cache");
var CacheUpdater = require("../server/cache-updater");
var Recacher = require("../server/re-cacher");
var Album = require("../api-types");
var localRequest = require("./local-request");

var requestShouldNotFail = function(done) { return function(data, error) {
    done.fail("Should not fail to get albums for request.\n" +
        "Error: " + error + "\n" +
        "Data: " + data);
} }

describe("Concurrent tag caching server", function() {
    var bandcamp;
    var cache;
    var updater;
    var recacher;

    beforeEach(function(done) {
        bandcamp = new BandcampFake();
        bandcamp.delay = 1;
        cache = new Cache();
        updater = new CacheUpdater(cache, bandcamp);
        recacher = new Recacher(cache, updater);
        server.start(cache, updater, recacher, done);
    });

    afterEach(function(done) {
        server.stop(done);
    });

    it("only caches tag once when new request asks for tag in progress of update", function(done) {
        bandcamp.setAlbumsForTag("tag", [ new Album("Album") ]);

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
        bandcamp.setAlbumsForTag("tag1", [ new Album("Album1") ]);
        bandcamp.setAlbumsForTag("tag2", [ new Album("Album2") ]);

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

describe("Recaching server", function() {
    var bandcamp;
    var cache;
    var updater;
    var recacher;

    beforeEach(function(done) {
        bandcamp = new BandcampFake();
        bandcamp.delay = 1;
        cache = new Cache();
        updater = new CacheUpdater(cache, bandcamp);
        recacher = new Recacher(cache, updater);
        recacher.cacheDelay = 0.001;
        server.start(cache, updater, recacher, done);
    });

    afterEach(function(done) {
        if(server.isRunning) {
            server.stop(done);
        }
        else {
            done();
        }
    });

    it("recaches tags when idle", function(done) {
        bandcamp.setAlbumsForTag("tag", [ new Album("Album1") ]);

        updater.queueTags(["tag"]);

        setTimeout(function() {
            expect(bandcamp.tagsRequested.length).toBe(2);
            done();
        }, 20);
    });

    it("stops recaching when stopping server", function(done) {
        server.stop(function() {
            bandcamp.setAlbumsForTag("tag", [ new Album("Album1") ]);

            updater.queueTags(["tag"]);

            setTimeout(function() {
                expect(bandcamp.tagsRequested.length).toBe(1);
                done();
            }, 20);
        });
    });
});