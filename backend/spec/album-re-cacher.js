var Recacher = require("../album-re-cacher");
var DatabaseFake = require("./database-fake");
var Album = require("../album-type");

describe("Album recacher", function() {
    var database;
    var updater;
    var sut;
    var hasLogged = false;

    beforeEach(async function() {
        database = new DatabaseFake();
        updater = {
            calledUpdates: [],
            updateAlbum: async function(album) {
                this.calledUpdates = this.calledUpdates.concat(album);
            },
            isIdle: function() { return true; }
        };

        sut = new Recacher(database, updater, function() { hasLogged = true; });
        sut.cacheDelay = 0.001;
    });

    var execute = async function() { await sut.execute(); }

    var expectUpdateCallCountToBe = function(callCount) {
        expect(updater.calledUpdates.length).toEqual(callCount);
    };
    
    var expectUpdateAlbumToBe = function(album) {
        expectUpdateCallCountToBe(1);
        expect(updater.calledUpdates[0]).toEqual(album)
    };

    it("does nothing if no albums exist in database", async () => {
        await execute();
        expectUpdateCallCountToBe(0);
    });

    it("caches album without fully cached tags", async () => {
        var album = new Album(10, "", "", "", "", 0)
        database.saveTagAlbums("tag", [album]);

        await execute();
        expectUpdateAlbumToBe(album);
    });

    it("ignores albums with already fully cached tags", async () => {
        var album = new Album(10, "", "", "", "", 0)
        album.hasTagsBeenUpdated = true;
        database.saveTagAlbums("tag", [album]);

        await execute();
        expectUpdateCallCountToBe(0);
    });

    it("does not cache when updater is not idle", async () => {
        updater.isIdle = () => { return false };

        await execute();
        expectUpdateCallCountToBe(0);
    });

    it("logs and returns normally when recaching fails", async () => {
        database.getAlbumWithoutUpdatedTags = () => {
            throw new Error("error");
        };

        try {
            await execute();
        }
        catch(e) {
            fail("didn't handle errors from dependencies");
        }

        expect(hasLogged).toBe(true);
    });
});