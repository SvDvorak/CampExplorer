var request = require("request");


module.exports = function(tags, onResponse, onFailure) {
    var options =
    {
        method: "POST",
        uri: "http://localhost:8079/v1/albums",
        headers: { "Content-Type": "application/json;charset=UTF-8" },
        json: tags
    };

    request(options, function(error, response, data) {
        if(response.statusCode != 200) {
            onFailure(data, response.statusCode);
            return;
        }

        onResponse(data);
    });
}