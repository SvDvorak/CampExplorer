var Promise = require("bluebird");
var WorkerThread = require("./worker-thread");

var allowCrossDomain = function (req, response, next) {
    response.header('Access-Control-Allow-Origin', '*');
    response.header('Access-Control-Allow-Methods', 'POST');
    response.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
}

module.exports = {
    listenerApp: {},
    recacher: {},

    start: async function (config, database, updater, recacher, seeder, timeProvider, log) {
        var server = this;
        this.config = config;
        this.database = database;
        this.updater = updater;
        this.recacher = new WorkerThread(recacher, config.recacheIntervalInSeconds * 1000);
        this.timeProvider = timeProvider;
        this.log = log;
        this.requests = [];
        this.isRunning = true;

        log("Waiting for database connection")
        await database.waitForConnection()
        log("Database connection established");
        const databaseResult = await database.createIfNeeded();
        log(databaseResult);

        if (config.startSeed) {
            let seedTags = await seeder.seed(config.startSeed);
            unsavedTags = await server.database.getUnsavedTags(seedTags);
            await server.updater.updateTags(unsavedTags);
            log("Seeding finished");
        }

        await server.setupEndpointService();
    },

    setupEndpointService: async function () {
        var server = this;
        var express = require("express");
        var bodyParser = require("body-parser");
        var app = express();

        app.use(bodyParser.json());
        app.use(allowCrossDomain);

        app.post("/v1/albums", async (request, response) => {
            if (request.body.constructor !== Array) {
                response.status(400);
                response.send({ error: "Unable to parse request data" });
                return;
            }

            var requestedTags = request.body.slice(0, 10).map(x => x.toLowerCase());

            if (requestedTags.length == 0) {
                server.sendJSONSuccess(response, []);
                return;
            }

            try {
                await server.sendAlbumsForLoadedTags(response, requestedTags);
            }
            catch(error) {
                server.log(error);
            }

            server.requests.push(server.timeProvider.now());
        });

        app.get("/admin/tagcount", async (request, response) => {
            try {
                const tagCount = await server.database.getTagCount();
                server.sendJSONSuccess(response, tagCount);
            }
            catch(error) {
                server.sendJSONSuccess(response, 0);
            }
        });

        app.get("/admin/tagsinqueue", async (request, response) => {
            server.sendJSONSuccess(response, server.updater.queueLength());
        });

        app.get("/admin/currentlycachingtag", async (request, response) => {
            server.sendJSONSuccess(response, server.updater.currentlyCachingTag());
        });

        app.get("/admin/albumcount", async (request, response) => {
            server.database
                .getAlbumCount()
                .then(albumCount => server.sendJSONSuccess(response, albumCount))
                .catch(e => server.sendJSONSuccess(response, 0));
        });

        app.post("/admin/requestrate", async (request, response) => {
            server.cleanRequestHistory();
            var results = server.requests.filter(x => server.timeProvider.hoursSince(x) < request.body.sinceInHours);
            server.sendJSONSuccess(response, results.length);
        });


        return new Promise((resolve, reject) => {
            server.listenerApp = app.listen(this.config.port, function () {
                server.recacher.start();
                resolve();
            });
        });
    },

    sendAlbumsForLoadedTags: async function(response, requestedTags) {
        const unsavedTags = await this.database.getUnsavedTags(requestedTags);
        if (unsavedTags.length > 0) {
            await this.sendTagsNotLoaded(response, unsavedTags);
        }
        else {
            const albums = await this.database.getAlbumsByTags(90, requestedTags)
            this.sendJSONSuccess(response, albums);
        }
    },

    sendTagsNotLoaded: async function (response, unsavedTags) {
        response.status(202);
        response.send({
            error: "Tags not loaded, try again later",
            data: unsavedTags
        });
        this.updater.updateTags(unsavedTags);
    },

    sendJSONSuccess: function (response, data) {
        response.status(200);
        response.send(JSON.stringify(data));
    },

    cleanRequestHistory: function () {
        var hourLimit = 24;
        this.requests = this.requests.filter(x => this.timeProvider.hoursSince(x) < hourLimit);
    },

    stop: function () {
        if (this.isRunning) {
            this.isRunning = false;
            this.recacher.stop();
            var server = this;
            return new Promise((resolve, reject) => {
                server.listenerApp.close(resolve);
            });
        }
        else {
            return Promise.resolve();
        }
    },
};