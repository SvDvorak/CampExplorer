var Recacher = require("../source/re-cacher");
var Promise = require("bluebird");

describe("Recacher", function() {
    var cache;
    var updater;
    var finishedCall;
    var sut;

    beforeEach(function() {
        cache = { albums: { } };
        updater = {
            calledUpdates: [],
            queue: [],
            updateTags: function(tags) {
                this.calledUpdates = this.calledUpdates.concat(tags);
                return Promise.resolve();
            },
            isIdle: function() { return this.queue.length == 0; }
        };

        sut = new Recacher(cache, updater, function() { });
        sut.cacheDelay = 0.001;
    });

    var execute = function() { return sut.execute(); }

    var expectUpdateCallCountToBe = function(callCount) {
        return () => expect(updater.calledUpdates.length).toEqual(callCount);
    };
    
    var expectUpdateTagsToBe = function(tags) {
        return () => expect(updater.calledUpdates).toEqual(tags);
    };

    it("does nothing if no tags exist in cache", function(done) {
        execute()
            .then(expectUpdateCallCountToBe(0))
            .finally(done);
    });

    it("caches first tag in album cache", function(done) {
        cache.albums["tag"] = { };

        execute()
            .then(expectUpdateTagsToBe(["tag"]))
            .finally(done);
    });

    it("loops tags when having reached end of tag collection", function(done) {
        cache.albums["tag1"] = { };
        cache.albums["tag2"] = { };

        execute()
            .then(execute)
            .then(execute)
            .then(expectUpdateTagsToBe([ "tag1", "tag2", "tag1" ]))
            .finally(done);
    });

    it("does not cache when updater has tags in queue already", function(done) {
        cache.albums["tag1"] = { };
        cache.albums["tag2"] = { };

        updater.queue = [ "tag3", "tag4" ];

        execute()
            .then(expectUpdateCallCountToBe(0))
            .finally(done);
    });
});