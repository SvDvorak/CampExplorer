var Recacher = require("../source/re-cacher");
var DatabaseFake = require("./database-fake");
var Promise = require("bluebird");
require("./test-finished");

describe("Recacher", function() {
    var database;
    var updater;
    var finishedCall;
    var sut;

    beforeEach(function() {
        database = new DatabaseFake();
        updater = {
            calledUpdates: [],
            queue: [],
            updateTags: function(tags, callback) {
                this.calledUpdates = this.calledUpdates.concat(tags);
                callback();
            },
            isIdle: function() { return this.queue.length == 0; }
        };

        sut = new Recacher(database, updater, function() { });
        sut.cacheDelay = 0.001;
    });

    var execute = function() { return sut.execute(); }

    var expectUpdateCallCountToBe = function(callCount) {
        return () => expect(updater.calledUpdates.length).toEqual(callCount);
    };
    
    var expectUpdateTagsToBe = function(tags) {
        return () => expect(updater.calledUpdates).toEqual(tags);
    };

    it("does nothing if no tags exist in database", function(done) {
        execute()
            .then(expectUpdateCallCountToBe(0))
            .finally(done);
    });

    it("caches first tag in album cache", function(done) {
        database.savedTags.push("tag");

        execute()
            .then(expectUpdateTagsToBe(["tag"]))
            .testFinished(done);
    });

    it("loops tags when having reached end of tag collection", function(done) {
        database.savedTags.push("tag1");
        database.savedTags.push("tag2");

        execute()
            .then(execute)
            .then(execute)
            .then(expectUpdateTagsToBe([ "tag1", "tag2", "tag1" ]))
            .testFinished(done);
    });

    it("does not cache when updater has tags in queue already", function(done) {
        database.savedTags.push("tag1");
        database.savedTags.push("tag2");

        updater.queue = [ "tag3", "tag4" ];

        execute()
            .then(expectUpdateCallCountToBe(0))
            .testFinished(done);
    });
});