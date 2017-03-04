var Promise = require("bluebird");

Promise.prototype.testFinished = function(done)
{
    return this.then(done).catch(error => done.fail(error));
}