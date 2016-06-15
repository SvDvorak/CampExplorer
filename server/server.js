var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
}

module.exports = {
    server: {},
    recacher: {},

    start: function (albumCache, updater, recacher, startedCallback) {
        var express = require("express");
        var bodyParser = require("body-parser");
        var app = express();
        this.recacher = recacher;
        this.isRunning = true;

        const PORT=8079; 

        app.use(bodyParser.json());
        app.use(allowCrossDomain);

        app.post("/v1/albums", function(request, res) {
            if(request.body.constructor !== Array)
            {
                res.status(400);
                res.send({ error: "Unable to parse request data" });
                return;
            }

            var uncached = albumCache.filterUncached(request.body);
            if(uncached.length > 0)
            {
                res.status(202);
                res.send({
                    error: "Tags not cached, try again later",
                    data: uncached
                });
                updater.queueTags(uncached);
                return;
            }

            var albums = albumCache
                .getAlbumsByTags(request.body)
                .slice(0, 50);

            res.setHeader("Content-Type", "application/json");
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.status(200);
            res.send(JSON.stringify(albums));
        });

        app.get("/debug/tagcount", function(request, res) {
            res.status(200);
            res.send(JSON.stringify(Object.keys(albumCache.albums).length));
        });

        this.server = app.listen(PORT, function(){
            recacher.start();
            startedCallback();
        });
    },

    stop: function(stoppedCallback) {
        this.isRunning = false;
        this.server.close(stoppedCallback);
        this.recacher.stop();
    },
};