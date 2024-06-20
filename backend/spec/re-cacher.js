var Recacher = require("../re-cacher");
var DatabaseFake = require("./database-fake");

describe("Recacher", function() {
    var database;
    var updater;
    var sut;

    beforeEach(async function() {
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

    var execute = async function() { await sut.execute(); }

    var expectUpdateCallCountToBe = async (callCount) => {
        return () => expect(updater.calledUpdates.length).toEqual(callCount);
    };
    
    var expectUpdateTagsToBe = async (tags) => {
        return () => expect(updater.calledUpdates).toEqual(tags);
    };

    it("does nothing if no tags exist in database", async () => {
        await execute();
        expectUpdateCallCountToBe(0);
    });

    it("caches tag with oldest last update in database", async () => {
        database.savedTags.push("tag");

        await execute();
        expectUpdateTagsToBe(["tag"]);
    });

    it("does not cache when updater has tags in queue already", async () => {
        database.savedTags.push("tag1");
        database.savedTags.push("tag2");

        updater.queue = [ "tag3", "tag4" ];

        await execute();
        expectUpdateCallCountToBe(0);
    });

    it("logs and returns normally when recaching fails", async () => {
        database.savedTags.push("tag1");

        updater.updateTags = () => {
            throw new Error("error");
        };

        try {
            await execute();
        }
        catch(e) {
            fail("didn't handle errors from dependencies");
        }
    });
});