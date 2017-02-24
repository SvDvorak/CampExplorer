module.exports = requestShouldNotFail = function(done) { return function(data, error) {
    done.fail("Should not fail to get albums for request.\n" +
        "Error: " + error + "\n" +
        "Data: " + data);
} };