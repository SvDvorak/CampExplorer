var CachePersister = require("../server/cache-persister");
var Album = require("../api-types");

describe("Persister", function() {
	var sut;
	var cache;
	var scheduledCalls;
	var calledPath;
	var dataWritten;
	var expectedPath;
	var startDate = new Date(2016, 1, 1, 0, 0, 0, 0);

	beforeEach(function() {
		cache = { albums: { } };

		dataWritten = [];
		var writeJson = { async: function(path, data, done) {
			calledPath = path;
			dataWritten.push(data);
			done();
		} };

		scheduledCalls = { };
		scheduleAt = function(date, func) {
			scheduledCalls[date] = func;
		};

		expectedPath = "testpath";
		sut = new CachePersister(cache, writeJson, scheduleAt, expectedPath, function() { });		
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
});