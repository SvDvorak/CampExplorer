var TestServer = require("./test-server");
var Album = require("../api-types");
var localRequest = require("./local-request");

describe("Recaching server", function() {
    var testServer;
    var bandcamp;

    beforeEach(function(done) {
        testServer = new TestServer();
        bandcamp = testServer.bandcamp;
        bandcamp.delay = 1;
        testServer.recacher.cacheDelay = 0.001;
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