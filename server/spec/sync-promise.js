module.exports = SyncPromise = function(func) {
	func();
	ExceptionThrown: undefined
}
SyncPromise.resolve = () => { return new SyncPromise(() => { }); }

SyncPromise.prototype = {
	then: function(func) {
		func();
		return this;
	},
	catch: function(errorFunc) {
		if(SyncPromise.ExceptionThrown != undefined) {
			errorFunc("error");
		}
		return this;
	}
}