
module.exports = CachePersister = function(cache, writeJson, scheduleAt, path, log) {
	this.cache = cache;
	this.writeJson = writeJson;
	this.scheduleAt = scheduleAt;
	this.path = path;
	this.log = log;
	this.isRunning = false;

	this.getNextPersistDate = function(now) {
		var days = 1;
		var dat = new Date(now.valueOf());
	    dat.setDate(dat.getDate() + days);
	    return dat;
	};
};

CachePersister.prototype = {
	start: function(timeNow) {
		this.isRunning = true;
		this.scheduledPersist(this.getNextPersistDate(timeNow));
	},

	stop: function() {
		this.isRunning = false;
	},

	scheduledPersist: function(date) {
		var persister = this;

		this.scheduleAt(date, function() {
			if(!persister.isRunning)	{
				return;
			}

			persister.log("Persisting albums");
			persister.writeJson.async(
				persister.path,
				persister.cache.albums,
				function() {
					var nextPersistDate = persister.getNextPersistDate(date)
					persister.scheduledPersist(nextPersistDate);
				},
				function(error) { persister.log("Error writing json: " + error); });
		});
	}
};

Date.prototype.addDays = function(days)
{
}