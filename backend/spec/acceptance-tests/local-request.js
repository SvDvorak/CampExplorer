var Config = require("./config");
var request = require('request-promise');
var TagCriteria = require("../../tag-criteria");
const { timeout } = require("../../extensions");

function createOptions(data) {
    var config = new Config();
    var options = {
        method: "POST",
        uri: "http://localhost:" + config.port + "/v1/albums",
        headers: { "Content-Type": "application/json;charset=UTF-8" },
        json: data
    };
    return options;
}

const localRequest = function(includeTags, excludeTags) {
    var include = includeTags == null ? [] : includeTags.map(x => new TagCriteria("include", x));
    var exclude = excludeTags == null ? [] : excludeTags.map(x => new TagCriteria("exclude", x));

    var options = createOptions(include.concat(exclude));
    // Cant use request promise, seems to be some issue when not converting to bluebird
    return Promise.resolve(request(options));
}
const failRequest = function() {
    // Cant use request promise, seems to be some issue when not converting to bluebird
    return Promise.resolve(request(createOptions({ })));
}
const localCacheRequest = async function(tags) {
    // Have server cache up tags
    await localRequest(tags);
    await timeout(100);
}

module.exports = {
    localRequest,
    failRequest,
    localCacheRequest
}