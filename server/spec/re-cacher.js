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

    it("does nothing if no tags exist in cache", function() {
        sut.execute();

        expect(updater.calledUpdates.length).toEqual(0);
    });

    it("caches first tag in album cache", function() {
        cache.albums["tag"] = { };

        sut.execute();

        expect(updater.calledUpdates[0]).toEqual("tag");
    });

    it("loops tags when having reached end of tag collection", function() {
        cache.albums["tag1"] = { };
        cache.albums["tag2"] = { };

        sut.execute();
        sut.execute();
        sut.execute();

        expect(updater.calledUpdates).toEqual([ "tag1", "tag2", "tag1" ]);
    });

    it("does not cache when updater has tags in queue already", function() {
        cache.albums["tag1"] = { };
        cache.albums["tag2"] = { };

        updater.queue = [ "tag3", "tag4" ];

        sut.execute();

        expect(updater.calledUpdates.length).toEqual(0);
    });
});