var TestServer = require("./test-server");
var Album = require("../api-types");
var localRequest = require("./local-request");
var requestShouldNotFail = require("./request-should-not-fail");

describe("Concurrent tag caching server", function() {
    var testServer;
    var bandcamp;

    beforeEach(function(done) {
        testServer = new TestServer();
        bandcamp = testServer.bandcamp;
        bandcamp.delay = 1;
        testServer.start(done);
    });

    afterEach(function(done) {
        testServer.stop(done);
    });

    it("only caches tag once when new request asks for tag in progress of update", function(done) {
        bandcamp.setAlbumsForTag("tag", [ new Album("Album") ]);

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

    it("queues up tags to be updated and processes them in order", function(done) {
        bandcamp.setAlbumsForTag("tag1", [ new Album("Album1") ]);
        bandcamp.setAlbumsForTag("tag2", [ new Album("Album2") ]);

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