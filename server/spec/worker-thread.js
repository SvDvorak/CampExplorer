var Promise = require("bluebird");
var WorkerThread = require("../source/worker-thread");

describe("Worker Thread", function() {
    var worker;

    beforeEach(function() {
        worker = {
            calls: 0,
            execute: function() {
                this.calls++;
                return Promise.resolve();
            }
        };
        var delayTime = 1;
        sut = new WorkerThread(worker, delayTime);
    });

    afterEach(function() {
        sut.stop();
    });

    it("calls function repeatedly after previous call finishes", function(done) {
        worker.execute = function() {
            var worker = this;
            return new Promise((resolve, reject) => {
                setTimeout(function() {
                    worker.calls += 1;
                    resolve();
                }, 10);
            });
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