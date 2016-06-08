var server;

module.exports = {
    start: function (albumCache, startedCallback) {
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

            if(!albumCache.hasCached(request.body))
            {
                res.status(400);
                res.send({ error: "Tag not cached, try again later" });
                return;
            }

            var albums = albumCache.getAlbumsByTags(request.body);
            res.setHeader("Content-Type", "application/json");
            res.status(200);
            res.send(JSON.stringify(albums));
        });

        server = app.listen(PORT, function(){
            console.log("Server listening on: http://localhost:%s", PORT);
            startedCallback();
        });
      },

    stop: function(stoppedCallback) {
        server.close(stoppedCallback);
    }
};
