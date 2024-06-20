var TestServer = require("./test-server");
const { timeout } = require("../../extensions");

describe("Server using database", () => {
    var testServer;
    var database;

    beforeEach(async () => {
        testServer = new TestServer();
        database = testServer.database;
    });
    
    it("waits for database connection before starting server", async () => {
        var establishConnection = null;
        database.connectionPromise = new Promise((resolve, reject) => { establishConnection = resolve; })
        var isServerStarted = false;
        testServer.start().then(() => isServerStarted = true);

        await timeout(100);
        expect(isServerStarted).toBe(false);
        establishConnection();
        await timeout(100);
        expect(isServerStarted).toBe(true);
        await testServer.stop();
    });

    it("aborts server start if connection to database cannot be established", async () => {
        var failedConnection = null;
        database.connectionPromise = new Promise((resolve, reject) => { failedConnection = reject; })
        var threwError = false;
        testServer.start().catch(() => threwError = true);

        await timeout(20);
        failedConnection();
        await timeout(20);
        expect(threwError).toBe(true);
        await testServer.stop();
    });

    it("upgrades database at start", async () => {
        await testServer.start();
        expect(database.created).toBe(true);
        await testServer.stop();
    });
});