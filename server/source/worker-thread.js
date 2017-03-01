
module.exports = WorkerThread = function(worker, delay) {
    this.worker = worker;
    this.delay = delay;
};

WorkerThread.prototype = {
	start: function() {
        var worker = this.worker;
        this.interval = setInterval(function() { worker.execute(); }, this.delay);
	},

	stop: function() {
        clearTimeout(this.interval);
	}
};