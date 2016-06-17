
module.exports = scheduleAt = function(date, func) {
	var now = new Date();
	var millisTillDate = date - now;
	if (millisTillDate < 0) {
	     millisTillDate += 86400000; // it's after specified time, try next time tomorrow.
	}
	setTimeout(func, millisTillDate);
}