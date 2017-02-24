var Recacher = require("../source/re-cacher");

describe("Recacher", function() {
    var cache;
    var updater;
    var sut;

    beforeEach(function() {
        cache = { albums: { } };
        updater = {
            calledUpdates: [],
            queue: [],
            callback: function() { },
            updateTags: function(tags, callback) {
                this.onCallbackPassed(callback);
                this.callback = callback;
                this.calledUpdates = this.calledUpdates.concat(tags);
            },
            onCallbackPassed: function(callback) { callback(); },
            isIdle: function() { return this.queue.length == 0; }
        };

        sut = new Recacher(cache, updater, function() { });
        sut.cacheDelay = 0.001;
    });

    afterEach(function() {
        sut.stop();
    });

    it("does nothing if no tags exist in cache", function() {
        sut.start();

        expect(updater.calledUpdates.length).toEqual(0);
    });

    it("caches first tag in album cache at start", function() {
        cache.albums["tag"] = { };

        sut.start();

        expect(updater.calledUpdates[0]).toEqual("tag");
    });

    it("continues caching next tags after a delay after previous cache is done", function(done) {
        updater.onCallbackPassed = function() { };

        cache.albums["tag1"] = { };
        cache.albums["tag2"] = { };

        sut.start();

        setTimeout(function() {
            expect(updater.calledUpdates.length).toEqual(1);
            expect(updater.calledUpdates[0]).toEqual("tag1");

            updater.callback();

            setTimeout(function() {
                expect(updater.calledUpdates.length).toEqual(2);
                expect(updater.calledUpdates[1]).toEqual("tag2");
                done();
            }, 10);
        }, 10);
    });

    it("loops tags when having reached end of tag collection", function(done) {
        cache.albums["tag1"] = { };
        cache.albums["tag2"] = { };

        sut.start();

        setTimeout(function() {
            expect(updater.calledUpdates).toEqual([ "tag1", "tag2", "tag1" ]);
            done();
        }, 25);
    });

    it("stops background caching when calling stop", function(done) {
        cache.albums["tag"] = { };

        sut.start();

        sut.stop();

        setTimeout(function() {
            expect(updater.calledUpdates.length).toEqual(1);
            done();
        }, 35);
    });

    it("does not cache when updater has tags in queue already", function(done) {
        cache.albums["tag1"] = { };
        cache.albums["tag2"] = { };

        updater.queue = [ "tag3", "tag4" ];

        sut.start();

        setTimeout(function() {
            expect(updater.calledUpdates.length).toEqual(0);
            done();
        }, 35);
    });

    it("retries recaching after a delay even if it wasn't possible this call", function(done) {
        sut.start();

        cache.albums["tag1"] = { };

        setTimeout(function() {
            expect(updater.calledUpdates.length).toBeGreaterThan(0);
            done();
        }, 10);
    });
});