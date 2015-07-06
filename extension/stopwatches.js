'use strict';

var Rieussec = require('rieussec');
var NUM_STOPWATCHES = 4;

module.exports = function (nodecg) {
    var defaultStopwatch = {time: '00:00:00', state: 'stopped'};
    var defaultStopwatches = [defaultStopwatch, defaultStopwatch, defaultStopwatch, defaultStopwatch];
    var stopwatches = nodecg.Replicant('stopwatches', {defaultValue: defaultStopwatches});

    // Make an array of 4 Rieussec rieussecs
    var rieussecs = [null, null, null, null].map(function(val, index) {
        // Load the existing time and start the stopwatch at that.
        var startMs = 0;
        if (stopwatches.value[index].time) {
            var ts = stopwatches.value[index].time.split(':');
            startMs = Date.UTC(1970, 0, 1, ts[0], ts[1], ts[2]);
        }

        var rieussec = new Rieussec();
        rieussec.setMilliseconds(startMs);

        rieussec.on('tick', function(ms) {
            stopwatches.value[index].time = msToTime(ms);
        });

        rieussec.on('state', function(state) {
            stopwatches.value[index].state = state;
        });

        return rieussec;
    });

    nodecg.listenFor('startTime', function(index) {
        if (index === 'all') {
            rieussecs.forEach(function(sw) { sw.start(); });
        } else if (index >= 0 && index < NUM_STOPWATCHES) {
            rieussecs[index].start();
        } else {
            nodecg.log.error('index "%d" sent to "startTime" is out of bounds', index);
        }
    });

    nodecg.listenFor('pauseTime', function(index) {
        if (index === 'all') {
            rieussecs.forEach(function(sw) { sw.pause(); });
        } else if (index >= 0 && index < NUM_STOPWATCHES) {
            rieussecs[index].pause();
        } else {
            nodecg.log.error('index "%d" sent to "pauseTime" is out of bounds', index);
        }
    });

    nodecg.listenFor('resetTime', function(index) {
        if (index === 'all') {
            rieussecs.forEach(function(sw) { sw.reset(); });
        } else if (index >= 0 && index < NUM_STOPWATCHES) {
            rieussecs[index].reset();
        } else {
            nodecg.log.error('index "%d" sent to "resetTime" is out of bounds', index);
        }
    });

    function msToTime(duration) {
        var milliseconds = parseInt((duration%1000)/100),
            seconds = parseInt((duration/1000)%60),
            minutes = parseInt((duration/(1000*60))%60),
            hours = parseInt((duration/(1000*60*60))%24);

        hours = (hours < 10) ? '0' + hours : hours;
        minutes = (minutes < 10) ? '0' + minutes : minutes;
        seconds = (seconds < 10) ? '0' + seconds : seconds;

        return hours + ':' + minutes + ':' + seconds;
    }
};
