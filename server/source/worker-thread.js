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
            .then(() => console.log("Please queue man"))
            .then(() => workerThread.queueExecute())
            .catch(() => console.log("Seriously..."));
    },

    queueExecute: function() {
        var workerThread = this;
        console.log("queue execute! " + this.isRunning);
        if(workerThread.isRunning) {
            workerThread.interval = setTimeout(() => {
                console.log("execute!");
                workerThread.execute();
            }, workerThread.delay);
        }
    },

	stop: function() {
        clearTimeout(this.interval);
        this.isRunning = false;
	}
};