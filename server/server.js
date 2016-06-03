
module.exports = {
    bandcampApi : {},

    start: function (bandcampApi) {
        var express = require("express");
        var app = express();

        const PORT=8079; 

        app.get("/v1/tags/:tag", function(request, res) {
            var albums = bandcampApi.getAlbumsByTag(request.params.tag);
            res.setHeader("Content-Type", "application/json");
            res.status(200);
            res.send(JSON.stringify(albums));
        });

        app.listen(PORT, function(){
            console.log("Server listening on: http://localhost:%s", PORT);
        });
      },
};
