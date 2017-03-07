var CachePersister = require("../source/cache-persister");
var Album = require("../source/api-types");
var SyncPromise = require("./sync-promise");

describe("Persister", function() {
	var sut;
	var cache;
	var scheduledCalls;
	var calledPath;
	var logCalls;
	var dataWritten;
	var expectedPath;
	var shouldThrow;
	var startDate = new Date(2016, 1, 1, 0, 0, 0, 0);

	beforeEach(function() {
		cache = { albums: { } };

		dataWritten = [];
		var writeJson = { async: function(path, data) {
			calledPath = path;
			dataWritten.push(data);
			if(shouldThrow) {
				SyncPromise.ExceptionThrown = "error";
			}
			return SyncPromise.resolve();
		} };

		scheduledCalls = { };
		scheduleAt = function(date, dateFunc) {
			scheduledCalls[date] = dateFunc;
		};

		expectedPath = "testpath";
		shouldThrow = false;

		logCalls = [];
		var log = error => logCalls.push(error);
		sut = new CachePersister(cache, writeJson, scheduleAt, expectedPath, log);		
	});

	it("saves at start", function() {
		sut.start(startDate);

		expect(dataWritten.length).toEqual(1);
		expect(new Date(2016, 1, 2, 0, 0, 0, 0) in scheduledCalls).toBe(true);
	});

	it("saves to disk at set intervals", function() {
		var album1 = new Album("album1");
		var album2 = new Album("album2");
		var album3 = new Album("album3");

		sut.start(startDate);

		cache.albums = { tag: [ album1 ] };
		scheduledCalls[new Date(2016, 1, 2, 0, 0, 0, 0)]();
		cache.albums = { tag: [ album2 ] };
		scheduledCalls[new Date(2016, 1, 3, 0, 0, 0, 0)]();
		cache.albums = { tag: [ album3 ] };
		scheduledCalls[new Date(2016, 1, 4, 0, 0, 0, 0)]();

		expect(dataWritten[0]).toEqual({ });
		expect(dataWritten[1]["tag"]).toEqual([ album1 ]);
		expect(dataWritten[2]["tag"]).toEqual([ album2 ]);
		expect(dataWritten[3]["tag"]).toEqual([ album3 ]);
	});

	it("stops schedule when calling stop", function() {
		sut.start(startDate);
		sut.stop();

		scheduledCalls[new Date(2016, 1, 2, 0, 0, 0, 0)]();

		expect(new Date(2016, 1, 3, 0, 0, 0, 0) in scheduledCalls).toEqual(false);
	});

	it("uses parameter as file path", function() {
		sut.start(startDate);

		scheduledCalls[new Date(2016, 1, 2, 0, 0, 0, 0)]();
		expect(calledPath).toEqual(expectedPath);
	});

	it("logs error when unable to write to file", function() {
		shouldThrow = true;
		sut.start(startDate);

		var errorCalls = logCalls.filter(call => call.indexOf("error") !== -1 );
		expect(errorCalls.length).toBe(1);
	});
});