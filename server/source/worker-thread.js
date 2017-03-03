var Promise = require("bluebird");

module.exports = WorkerThread = function(worker, delay) {
    this.worker = worker;
    this.delay = delay;
};

WorkerThread.prototype = {
	start: function() {
        this.isRunning = true;
        this.execute();
	},

    execute: function() {
        var workerThread = this;
        workerThread.worker
            .execute()
            .then(() => {
                if(workerThread.isRunning) {
                    workerThread.interval = setTimeout(function() {
                        workerThread.execute();
                    }, workerThread.delay);
                }
            })
        },

	stop: function() {
        clearTimeout(this.interval);
        this.isRunning = false;
	}
};