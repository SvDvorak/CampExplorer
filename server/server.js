
module.exports = {
    bandcampApi : {},

    start: function (bandcampApi) {
        var express = require("express");
        var app = express();

        //Lets define a port we want to listen to
        const PORT=8079; 

        app.get("/", function(request, res) {
            var albums = bandcampApi.getAlbumsByTag("");
            res.setHeader("Content-Type", "application/json");
            res.status(200);
            res.send(JSON.stringify(albums));
        });

        app.listen(PORT, function(){
            console.log("Server listening on: http://localhost:%s", PORT);
        });
      },
};
