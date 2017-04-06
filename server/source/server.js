var Promise = require("bluebird");
var WorkerThread = require("./worker-thread");

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

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
            .then(() => log("Database connection established"));

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

        app.post("/v1/albums", function(request, res) {
            if(request.body.constructor !== Array)
            {
                res.status(400);
                res.send({ error: "Unable to parse request data" });
                return;
            }

            var requestedTags = request.body;

            if(requestedTags.length == 0) {
                sendJSONSuccess(res, [ ]);
                return;
            }

            server.database
                .getUnsavedTags(requestedTags)
                .then(unsavedTags => {
                    if(unsavedTags.length > 0)
                    {
                        res.status(202);
                        res.send({
                            error: "Tags not loaded, try again later",
                            data: unsavedTags
                        });
                        return server.updater.updateTags(unsavedTags);
                    }
                    else
                    {
                        return server.database
                            .getAlbumsByTags(50, requestedTags)
                            .then(albums => sendJSONSuccess(res, albums));
                    }
                })
                .catch(error => server.log(error));
        });

        app.get("/admin/tagcount", function(request, res) {
            server.database
                .getTagCount()
                .then(tagCount => 
                    sendJSONSuccess(res, tagCount))
                .catch(e => sendJSONSuccess(res, 0));
        });

        app.get("/admin/tagsinqueue", function(request, res) {
            sendJSONSuccess(res, server.updater.queueLength());
        });

        app.get("/admin/currentlycachingtag", function(request, res) {
            sendJSONSuccess(res, server.updater.currentlyCachingTag());
        });

        app.get("/admin/albumcount", function(request, res) {
            server.database
                .getAlbumCount()
                .then(albumCount => sendJSONSuccess(res, albumCount))
                .catch(e => sendJSONSuccess(res, 0));
        });

        var sendJSONSuccess = function(res, data) {
            res.status(200);
            res.send(JSON.stringify(data));
        };

        return new Promise((resolve, reject) => {
            server.listenerApp = app.listen(this.config.port, function() {
                server.recacher.start();
                resolve();
            });
        });
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