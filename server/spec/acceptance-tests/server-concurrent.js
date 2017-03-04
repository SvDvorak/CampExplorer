var TestServer = require("./test-server");
var Album = require("../../source/api-types");
var localRequest = require("./local-request");
var readJson = require("../../source/read-json");
var writeJson = require("../../source/write-json");
var fs = require("fs");
var removeCache = require("./remove-cache");
require("../test-finished");

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
        testServer.stop().then(done);
    });

    it("only caches tag once when new request asks for tag in progress of update", function(done) {
        bandcamp.setAlbumsForTag("tag", [ new Album("Album") ]);

        testServer
            .start()
            .then(() => localRequest(["tag"]))
            .then(() => localRequest(["tag"]))
            .delay(70)
            .then(() => localRequest(["tag"]))
            .then(albums => {
                    expect(bandcamp.tagsRequested.length).toBe(1);
                    expect(albums[0].name).toBe("Album");
                })
            .testFinished(done);
    });

    it("queues up tags to be updated and processes them in order", function(done) {
        bandcamp.setAlbumsForTag("tag1", [ new Album("Album1") ]);
        bandcamp.setAlbumsForTag("tag2", [ new Album("Album2") ]);

        testServer
            .start()
            .then(() => localRequest(["tag1", "tag2"]))
            .then(data => expect(data.data).toEqual([ "tag1", "tag2" ]))

            .delay(70)
            .then(() => expect(bandcamp.tagsRequested).toEqual([ "tag1", "tag2" ]))
            .then(() => localRequest([ "tag2" ]))
            .then(albums => expect(albums[0].name).toBe("Album2"))
            .testFinished(done);
    });

    it("saves cache to disk once a day", function(done) {
        var album = new Album("Album");
        bandcamp.setAlbumsForTag("tag", [ album ]);

        var oldPersistDateFunc = persister.getNextPersistDate;
        persister.getNextPersistDate = function(now) { return new Date(now + 100) }

        testServer.start()
            .then(() => localRequest(["tag"]))
            .delay(200)
            .then(() => {
                var albums = readJson.sync(testServer.config.persistPath);
                expect(albums["tag"][0].name).toEqual(album.name);

                persister.getNextPersistDate = oldPersistDateFunc;
            })
            .testFinished(done);
    });

    it("loads albums from disk if available at start", function(done) {
        var album = new Album("Album");
        // Need two tags since recacher starts working on first at start
        writeJson.sync(testServer.config.persistPath, { tag1: [ ], tag2: [ album ] });

        testServer.start()
            .delay(100)
            .then(() => localRequest(["tag2"]))
            .then(albums => expect(albums[0].name).toBe("Album"))
            .testFinished(done);
    });

    it("uses seeder when cache is not available on disk", function(done) {
        var album1 = new Album("Album1");
        var album2 = new Album("Album2");
        bandcamp.setAlbumsForTag("tag", [ album1 ]);
        bandcamp.setAlbumsForTag("tag_sub1", [ album2 ]);
        bandcamp.setTagsForAlbum(album1, [ "tag_sub1" ]);

        testServer.config.startSeed = "tag";

        testServer
            .start()
            .delay(100)
            .then(() => localRequest(["tag_sub1"]))
            .then(albums => {
                expect(albums.length).toBe(1);
                expect(albums[0].name).toEqual(album2.name);
            })
            .testFinished(done);
    });
});
