var moment = require("moment");

module.exports = TimeProvider = function() {
    this.moment = moment;
}

TimeProvider.prototype = {
    now: function() {
        return this.moment();
    },

    setTime: function(time) {
        this.moment = () => time;
    },

    minutesSince: function(time) {
        return moment().diff(time, 'minutes');
    },

    hoursSince: function(time) {
        return moment().diff(time, 'hours');
    }
}