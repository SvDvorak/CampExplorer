var TestServer = require("./test-server");
var Album = require("../../api-types");
var localRequest = require("./local-request");
var requestShouldNotFail = require("./request-should-not-fail");
var readJson = require("../../server/read-json");
var writeJson = require("../../server/write-json");
var fs = require("fs");
var removeCache = require("./remove-cache");

describe("Concurrent tag caching server", function() {
    var testServer;
    var bandcamp;
    var persister;

    beforeEach(function() {
        testServer = new TestServer();
        removeCache(testServer.config.persistPath);
        bandcamp = testServer.bandcamp;
        bandcamp.delay = 1;
        persister = testServer.persister;
    });

    afterEach(function(done) {
        testServer.stop(done);
    });

    it("only caches tag once when new request asks for tag in progress of update", function(done) {
        bandcamp.setAlbumsForTag("tag", [ new Album("Album") ]);

        testServer.start(function() {
            localRequest(["tag"]);
            localRequest(["tag"]);

            setTimeout(function() {
                localRequest([ "tag" ], function(albums) {
                    expect(bandcamp.tagsRequested.length).toBe(1);
                    expect(albums[0].name).toBe("Album");
                    done();
                }, requestShouldNotFail(done));
            }, 70);
        });
    });

    it("queues up tags to be updated and processes them in order", function(done) {
        bandcamp.setAlbumsForTag("tag1", [ new Album("Album1") ]);
        bandcamp.setAlbumsForTag("tag2", [ new Album("Album2") ]);

        testServer.start(function() {
            localRequest(["tag1", "tag2"], function() { }, function(data, responseCode) {
                expect(data.data).toEqual([ "tag1", "tag2" ]);
            });

            setTimeout(function() {
                expect(bandcamp.tagsRequested).toEqual([ "tag1", "tag2" ]);
                localRequest([ "tag2" ], function(albums) {
                    expect(albums[0].name).toBe("Album2");
                    done();
                }, requestShouldNotFail(done));
            }, 70);
        });
    });

    it("saves cache to disk once a day", function(done) {
        var album = new Album("Album");
        bandcamp.setAlbumsForTag("tag", [ album ]);

        var oldPersistDateFunc = persister.getNextPersistDate;
        persister.getNextPersistDate = function(now) { return new Date(now + 100) }

        testServer.start(function() {
            localRequest(["tag"]);

            setTimeout(function() {
                var albums = readJson.sync("./cache.json");
                expect(albums["tag"][0].name).toEqual(album.name);

                persister.getNextPersistDate = oldPersistDateFunc;
                done();
            }, 200);
        });
    });

    it("loads albums from disk if available at start", function(done) {
        var album = new Album("Album");
        // Need two tags since recacher starts working on first at start
        writeJson.sync(testServer.config.persistPath, { tag1: [ ], tag2: [ album ] });

        testServer.start(function() {
            setTimeout(function() {
                localRequest(["tag2"], function(albums) {
                    expect(albums[0].name).toBe("Album");

                    done();
                });
            }, 100);
        });
    });

    it("uses seeder when cache is not available on disk", function(done) {
        var album1 = new Album("Album1");
        var album2 = new Album("Album2");
        bandcamp.setAlbumsForTag("tag", [ album1 ]);
        bandcamp.setAlbumsForTag("tag_sub1", [ album2 ]);
        bandcamp.setTagsForAlbum(album1, [ "tag_sub1" ]);

        testServer.config.startSeed = "tag";

        testServer.start(function() {
            setTimeout(function() {
                localRequest(["tag_sub1"], function(albums) {
                    expect(albums.length).toBe(1);
                    expect(albums[0].name).toEqual(album2.name);

                    done();
                }, function() { done.fail("failed tag request"); });
            }, 100);
        });
    });
});