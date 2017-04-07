var Promise = require("bluebird");
var WorkerThread = require("./worker-thread");

var allowCrossDomain = function(req, response, next) {
    response.header('Access-Control-Allow-Origin', '*');
    response.header('Access-Control-Allow-Methods', 'POST');
    response.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
}

module.exports = {
    listenerApp: {},
    recacher: {},

    start: function (config, database, updater, recacher, seeder, log) {
        var server = this;
        this.config = config;
        this.database = database;
        this.updater = updater;
        this.recacher = new WorkerThread(recacher, config.recacheIntervalInSeconds*1000);
        this.log = log;
        this.isRunning = true;

        log("Waiting for database connection")
        var startPromise = database
            .waitForConnection()
            .then(() => log("Database connection established"))
            .then(() => database.createIfNeeded())
            .then(result => log(result));

        if(config.startSeed) {
            startPromise
                .then(() => seeder.seed(config.startSeed))
                .then(tags => server.updater.updateTags(tags));
        }

        return startPromise.then(() => server.setupEndpointService());
    },

    setupEndpointService: function() {
        var server = this;
        var express = require("express");
        var bodyParser = require("body-parser");
        var app = express();

        app.use(bodyParser.json());
        app.use(allowCrossDomain);

        app.post("/v1/albums", function(request, response) {
            if(request.body.constructor !== Array)
            {
                response.status(400);
                response.send({ error: "Unable to parse request data" });
                return;
            }

            var requestedTags = request.body;

            if(requestedTags.length == 0) {
                server.sendJSONSuccess(response, [ ]);
                return;
            }

            server.sendAlbumsForLoadedTags(response, requestedTags)
                .catch(error => server.log(error));
        });

        app.get("/admin/tagcount", function(request, response) {
            server.database
                .getTagCount()
                .then(tagCount => server.sendJSONSuccess(response, tagCount))
                .catch(e => server.sendJSONSuccess(response, 0));
        });

        app.get("/admin/tagsinqueue", function(request, response) {
            server.sendJSONSuccess(response, server.updater.queueLength());
        });

        app.get("/admin/currentlycachingtag", function(request, response) {
            server.sendJSONSuccess(response, server.updater.currentlyCachingTag());
        });

        app.get("/admin/albumcount", function(request, response) {
            server.database
                .getAlbumCount()
                .then(albumCount => server.sendJSONSuccess(response, albumCount))
                .catch(e => server.sendJSONSuccess(response, 0));
        });


        return new Promise((resolve, reject) => {
            server.listenerApp = app.listen(this.config.port, function() {
                server.recacher.start();
                resolve();
            });
        });
    },

    sendAlbumsForLoadedTags: function(response, requestedTags) {
        var server = this;
        return this.database
            .getUnsavedTags(requestedTags)
            .then(unsavedTags => {
                if(unsavedTags.length > 0)
                {
                    return server.sendTagsNotLoaded(response, unsavedTags);
                }
                else
                {
                    return server.database
                        .getAlbumsByTags(50, requestedTags)
                        .then(albums => server.sendJSONSuccess(response, albums));
                }
            })
    },

    sendTagsNotLoaded: function(response, unsavedTags) {
        response.status(202);
        response.send({
            error: "Tags not loaded, try again later",
            data: unsavedTags
        });
        return this.updater.updateTags(unsavedTags);
    },

    sendJSONSuccess: function(response, data) {
        response.status(200);
        response.send(JSON.stringify(data));
    },

    stop: function() {
		if(this.isRunning) {
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