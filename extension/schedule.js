'use strict';

// Schedule is kept in a google document
var SCHEDULE_KEY = '1GmSClaGLBzBTfRvxdaKl-KdHhqk7P6MeweE_KvAYKps';
var POLL_INTERVAL = 3 * 60 * 1000;

var GoogleSpreadsheet = require('google-spreadsheet');
var Q = require('q');

module.exports = function (nodecg) {
    var schedule = nodecg.Replicant('schedule', {defaultValue: []});
    var currentRun = nodecg.Replicant('currentRun', {defaultValue: {}});
    var scheduleDoc = new GoogleSpreadsheet(SCHEDULE_KEY);
    var lastUpdated = '';

    // Get initial data
    update();

    // Get latest schedule data every POLL_INTERVAL milliseconds
    nodecg.log.info('Polling schedule every %d seconds...', POLL_INTERVAL / 1000);
    var updateInterval = setInterval(update.bind(this), POLL_INTERVAL);

    // Dashboard can invoke manual updates
    nodecg.listenFor('updateSchedule', function(data, cb) {
        nodecg.log.info('Manual schedule update button pressed, invoking update...');
        clearInterval(updateInterval);
        updateInterval = setInterval(update.bind(this), POLL_INTERVAL);
        update()
            .then(function (wasUpdated) {
                cb(null, wasUpdated);
            }, function (error) {
                cb(error);
            });
    });

    function update() {
        var deferred = Q.defer();
        scheduleDoc.getInfo(function gotInfo(err, sheet) {
            if (err) {
                var msg = 'Could not get schedule data:' + err.message;
                nodecg.log.error(msg);
                deferred.reject(msg);
                return;
            }

            if (sheet.updated === lastUpdated) {
                nodecg.log.info('Schedule unchanged, not updating');
                deferred.resolve(false);
                return;
            }

            lastUpdated = sheet.updated;
            sheet.worksheets[0].getRows(function gotRows(err, rows) {
                if (err) {
                    var msg = 'Could not get schedule data:' + err.message;
                    nodecg.log.error(msg);
                    deferred.reject(msg);
                    return;
                }

                /* jshint -W083 */
                // Google returns a large amount of data that we don't need. We filter most of that out.
                var relevantData = [];
                var len = rows.length;
                for (var i = 0; i < len; i++) {
                    // Split up runners string into array of runners and trim whitespace
                    var runners = rows[i].runners.split(',').map(function(runner) {
                        return runner.trim();
                    });

                    // Split up streamlinks string into array of streamlinks and trim whitespace
                    var streamlinks = rows[i].streamlinks.split(',').map(function(streamlink) {
                        return streamlink.trim();
                    });

                    relevantData.push({
                        game: rows[i].game || 'Unknown',
                        runners: runners || ['Unknown'],
                        console: rows[i].console || 'Unknown',
                        estimate: rows[i].estimate || 'Unknown',
                        comments: rows[i].comments || 'None',
                        category: rows[i].category || 'Any%',
                        startTime: Date.parse(rows[i]['dateandtimecdtutc-5']) || null,
                        streamlinks: streamlinks || ['Unknown'],
                        index: i
                    });
                }
                /* jshint +W083 */

                // If no currentRun is set, set one
                if (typeof(currentRun.value.game) === 'undefined') {
                    currentRun.value = relevantData[0];
                }

                schedule.value = relevantData;
                nodecg.log.info('Updated schedule, timestamp', lastUpdated);
                deferred.resolve(true);
            });
        });
        return deferred.promise;
    }
};
