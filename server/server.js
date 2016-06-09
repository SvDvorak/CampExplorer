var server;

module.exports = {
    start: function (albumCache, updater, startedCallback) {
        var express = require("express");
        var bodyParser = require("body-parser");
        var app = express();

        const PORT=8079; 

        app.use(bodyParser.json());

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
                res.status(400);
                res.send({
                    error: "Tags not cached, try again later",
                    code: "NOT_CACHED",
                    data: uncached
                });
                updater.queueTags(uncached);
                return;
            }

            var albums = albumCache.getAlbumsByTags(request.body);
            res.setHeader("Content-Type", "application/json");
            res.status(200);
            res.send(JSON.stringify(albums));
        });

        server = app.listen(PORT, function(){
            startedCallback();
        });
      },

    stop: function(stoppedCallback) {
        server.close(stoppedCallback);
    },
};