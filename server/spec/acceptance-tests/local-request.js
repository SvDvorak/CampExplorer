var request = require("request");
var Config = require("./config");

module.exports = function(tags, onResponse, onFailure) {
    var config = new Config();
    
    var options =
    {
        method: "POST",
        uri: "http://localhost:" + config.port + "/v1/albums",
        headers: { "Content-Type": "application/json;charset=UTF-8" },
        json: tags
    };

    request(options, function(error, response, data) {
        if(response == undefined) {
            console.log("refused connection");
            return;
        }

        if(response.statusCode == 200) {
            if(onResponse != undefined) {
                onResponse(data);
            }
            return;
        }

        if(onFailure != undefined) {
            onFailure(data, response.statusCode);
        }
    });
}