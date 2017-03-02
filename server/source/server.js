var WorkerThread = require("./worker-thread");

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
}

module.exports = {
    server: {},
    recacher: {},

    start: function (config, albumCache, updater, recacher, persister, initialDataLoader, startedCallback) {
        var server = this;
        this.config = config;
        this.albumCache = albumCache;
        this.updater = updater;
        this.recacher = new WorkerThread(recacher, config.recacheIntervalInSeconds*1000);
        this.persister = persister;
        this.startedCallback = startedCallback;
        this.isRunning = true;

        initialDataLoader.load(function() {
            server.setupEndpointService();
        });
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

            var uncached = server.albumCache.filterUncached(request.body);
            if(uncached.length > 0)
            {
                res.status(202);
                res.send({
                    error: "Tags not cached, try again later",
                    data: uncached
                });
                server.updater.updateTags(uncached);
                return;
            }

            var albums = server.albumCache
                .getAlbumsByTags(request.body)
                .slice(0, 50);

            res.setHeader("Content-Type", "application/json");
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.status(200);
            res.send(JSON.stringify(albums));
        });

        app.get("/debug/tagcount", function(request, res) {
            res.status(200);
            res.send(JSON.stringify(Object.keys(server.albumCache.albums).length));
        });

        this.server = app.listen(this.config.port, function(){
            server.recacher.start();
            server.persister.start(Date.now());
            server.startedCallback();
        });
    },

    stop: function(stoppedCallback) {
        this.isRunning = false;
        this.server.close(stoppedCallback);
        this.recacher.stop();
        this.persister.stop();
    },
};