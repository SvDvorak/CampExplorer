
module.exports = WorkerThread = function(worker, delay) {
    this.worker = worker;
    this.delay = delay;
};

WorkerThread.prototype = {
	start: function() {
        this.isRunning = true;
        this.execute();
	},

    execute: async function() {
        var workerThread = this;
        while(workerThread.isRunning)
        {
            await new Promise(r => setTimeout(r, workerThread.delay));
            await workerThread.worker.execute();
        }
    },

	stop: function() {
        this.isRunning = false;
	}
};