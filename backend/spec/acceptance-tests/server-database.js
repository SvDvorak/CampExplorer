var TestServer = require("./test-server");
var Promise = require("bluebird");
require("../test-finished");

describe("Server using database", function() {
    var testServer;
    var database;

    beforeEach(function() {
        testServer = new TestServer();
        database = testServer.database;
    });
    
    it("waits for database connection before starting server", function(done) {
        var establishConnection = null;
        database.connectionPromise = new Promise((resolve, reject) => { establishConnection = resolve; })
        var serverStart = testServer.start();

        Promise
            .delay(20)
            .then(() => expect(serverStart.isPending()).toBe(true))
            .then(() => establishConnection())
            .delay(20)
            .then(() => expect(serverStart.isFulfilled()).toBe(true))
            .then(() => testServer.stop())
            .testFinished(done);
    });

    it("aborts server start if connection to database cannot be established", function(done) {
        var failedConnection = null;
        database.connectionPromise = new Promise((resolve, reject) => { failedConnection = reject; })
        var threwError = false;
        var serverStart = testServer.start().catch(() => threwError = true);

        Promise
            .delay(20)
            .then(() => failedConnection())
            .delay(20)
            .then(() => expect(threwError).toBe(true))
            .testFinished(done);
    });

    it("upgrades database at start", function(done) {
        testServer.start()
            .then(() => expect(database.created).toBe(true))
            .then(() => testServer.stop())
            .testFinished(done);
    });
});