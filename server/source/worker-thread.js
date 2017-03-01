
module.exports = WorkerThread = function(worker, delay) {
    this.worker = worker;
    this.delay = delay;
};

WorkerThread.prototype = {
	start: function() {
        this.execute();
	},

    execute: function() {
        var workerThread = this;
        workerThread.worker.execute(function() {
            workerThread.interval = setTimeout(function() {
                workerThread.execute();
            }, workerThread.delay);
        })
    },

	stop: function() {
        clearTimeout(this.interval);
	}
};