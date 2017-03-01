var WorkerThread = require("../source/worker-thread");

describe("Worker Thread", function() {
    var worker;

    beforeEach(function() {
        worker = {
            calls: 0,
            execute: function(callback) {
                this.calls++;
                callback();
            }
        };
        var delayTime = 1;
        sut = new WorkerThread(worker, delayTime);
    });

    afterEach(function() {
        sut.stop();
    });

    it("calls function repeatedly after previous call finishes", function(done) {
        worker.execute = function(callback) {
            var worker = this;
            setTimeout(function() {
                worker.calls += 1;
                callback();
            }, 10);
        };

        sut.start();

        setTimeout(function() {
            expect(worker.calls).toBeLessThan(10);
            done();
        }, 100);
    });

    it("calls using delay", function(done) {
        sut.delay = 50;

        sut.start();

        setTimeout(function() {
            expect(worker.calls).toEqual(2);
            done();
        }, 60);
    });

    it("stops work when calling stop", function(done) {
        sut.start();
        sut.stop();

        setTimeout(function() {
            expect(worker.calls).toEqual(1);
            done();
        }, 60);
    });
});