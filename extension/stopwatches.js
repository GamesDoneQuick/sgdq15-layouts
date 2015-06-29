'use strict';

var moment = require('moment');
var Rieussec = require('rieussec');

module.exports = function (nodecg) {
    var timesDefault = ['00:00:00', '00:00:00', '00:00:00', '00:00:00'];
    var times = nodecg.Replicant('times', {defaultValue: timesDefault});

    // Make an array of 4 Rieussec stopwatches
    var stopwatches = [null, null, null, null].map(function(val, index) {
        // Load the existing time and start the stopwatch at that.
        var ts = times.value[index].split(':');
        var ms = Date.UTC(1970, 0, 1, ts[0], ts[1], ts[2]);
        var stopwatch = new Rieussec();
        stopwatch.setMilliseconds(ms);
        stopwatch.on('tick', function(ms) {
            times.value[index] = moment(ms, 'hh:mm:ss');
        });
        return stopwatch;
    });

    nodecg.listenFor('startTime', function(index) {
        if (index === 'all') {
            stopwatches.forEach(function(sw) { sw.start(); });
        } else {
            stopwatches[index].start();
        }
    });

    nodecg.listenFor('pauseTime', function(index) {
        if (index === 'all') {
            stopwatches.forEach(function(sw) { sw.pause(); });
        } else {
            stopwatches[index].pause();
        }
    });

    nodecg.listenFor('resetTime', function(index) {
        if (index === 'all') {
            stopwatches.forEach(function(sw) { sw.reset(); });
        } else {
            stopwatches[index].reset();
        }
    });
};
