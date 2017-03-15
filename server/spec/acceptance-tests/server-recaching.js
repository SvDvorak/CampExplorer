var TestServer = require("./test-server");
var Album = require("../../source/api-types");
var localRequest = require("./local-request");
var removeCache = require("./remove-cache");
require("../test-finished");

describe("Recaching server", function() {
    var testServer;
    var bandcamp;

    beforeEach(function(done) {
        testServer = new TestServer();
        removeCache(testServer.config.persistPath);
        bandcamp = testServer.bandcamp;
        bandcamp.delay = 1;
        testServer.config.recacheIntervalInSeconds = 15.0/1000.0;
        testServer.start().then(done);
    });

    afterEach(function(done) {
        testServer.stop().then(done);
    });

    it("recaches tags when idle", function(done) {
        bandcamp.setAlbumsForTag("tag", [ new Album("0", "Album1") ]);

        localRequest(["tag"])
            .delay(20)
            .then(() => expect(bandcamp.tagsRequested.length).toBe(2))
            .testFinished(done);
    });

    it("stops recaching when stopping server", function(done) {
        localRequest(["tag"])
            .then(() => testServer.stop())
            .then(() => bandcamp.setAlbumsForTag("tag", [ new Album("0", "Album1") ]))
            .delay(70)
            .then(() => expect(bandcamp.tagsRequested.length).toBe(1))
            .testFinished(done);
    });
});