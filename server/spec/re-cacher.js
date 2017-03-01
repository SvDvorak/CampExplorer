var Recacher = require("../source/re-cacher");

describe("Recacher", function() {
    var cache;
    var updater;
    var finishedCall;
    var onFinished = function() { finishedCall = true; };
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
        finishedCall = false;

        sut = new Recacher(cache, updater, function() { });
        sut.cacheDelay = 0.001;
    });

    var execute = function() { sut.execute(onFinished); }

    it("does nothing if no tags exist in cache", function() {
        execute();

        expect(updater.calledUpdates.length).toEqual(0);
    });

    it("caches first tag in album cache", function() {
        cache.albums["tag"] = { };

        execute();

        expect(updater.calledUpdates[0]).toEqual("tag");
        expect(finishedCall).toBe(true);
    });

    it("loops tags when having reached end of tag collection", function() {
        cache.albums["tag1"] = { };
        cache.albums["tag2"] = { };

        execute();
        execute();
        execute();

        expect(updater.calledUpdates).toEqual([ "tag1", "tag2", "tag1" ]);
    });

    it("does not cache when updater has tags in queue already", function() {
        cache.albums["tag1"] = { };
        cache.albums["tag2"] = { };

        updater.queue = [ "tag3", "tag4" ];

        execute();

        expect(updater.calledUpdates.length).toEqual(0);
        expect(finishedCall).toBe(true);
    });
});