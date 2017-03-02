var TestServer = require("./test-server");
var Album = require("../../source/api-types");
var localRequest = require("./local-request");
var removeCache = require("./remove-cache");

describe("Recaching server", function() {
    var testServer;
    var bandcamp;

    beforeEach(function(done) {
        testServer = new TestServer();
        removeCache(testServer.config.persistPath);
        bandcamp = testServer.bandcamp;
        bandcamp.delay = 1;
        testServer.config.recacheIntervalInSeconds = 15.0/1000.0;
        testServer.start(done);
    });

    afterEach(function(done) {
        testServer.stop(done);
    });

    it("recaches tags when idle", function(done) {
        bandcamp.setAlbumsForTag("tag", [ new Album("Album1") ]);

        localRequest(["tag"]);

        setTimeout(function() {
            expect(bandcamp.tagsRequested.length).toBe(2);
            done();
        }, 20);
    });

    it("stops recaching when stopping server", function(done) {
        localRequest(["tag"], function() { }, function() {
            testServer.stop(function() {
                bandcamp.setAlbumsForTag("tag", [ new Album("Album1") ]);

                setTimeout(function() {
                    expect(bandcamp.tagsRequested.length).toBe(1);
                    done();
                }, 70);
            });
        });
    });
});