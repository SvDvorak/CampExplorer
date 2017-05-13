var Promise = require("bluebird");

module.exports = WorkerThread = function(worker, delay) {
    this.worker = worker;
    this.delay = delay;
};

WorkerThread.prototype = {
	start: function() {
        this.isRunning = true;
        this.queueExecute();
	},

    execute: function() {
        var workerThread = this;
        workerThread.worker
            .execute()
            .then(() => workerThread.queueExecute());
    },

    queueExecute: function() {
        var workerThread = this;
        if(workerThread.isRunning) {
            workerThread.interval = setTimeout(() => {
                workerThread.execute();
            }, workerThread.delay);
        }
    },

	stop: function() {
        clearTimeout(this.interval);
        this.isRunning = false;
	}
};