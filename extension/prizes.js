/* jshint -W106 */
'use strict';

// The list of currently active prizes can be retrieved from this url
// TODO: CHANGE THIS BACK
//var PRIZES_URL = 'https://gamesdonequick.com/tracker/search/?type=prize&feed=current';
var PRIZES_URL = 'https://gamesdonequick.com/tracker/search/?type=prize&event=16';
var POLL_INTERVAL = 3 * 60 * 1000;

var util = require('util');
var Q = require('q');
var request = require('request');
var equal = require('deep-equal');
var numeral = require('numeral');

module.exports = function (nodecg) {
    var currentPrizes = nodecg.Replicant('currentPrizes', {defaultValue: []});

    // Get initial data
    update();

    // Get latest prize data every POLL_INTERVAL milliseconds
    nodecg.log.info('Polling prizes every %d seconds...', POLL_INTERVAL / 1000);
    var updateInterval = setInterval(update.bind(this), POLL_INTERVAL);

    // Dashboard can invoke manual updates
    nodecg.listenFor('updatePrizes', function(data, cb) {
        nodecg.log.info('Manual prize update button pressed, invoking update...');
        clearInterval(updateInterval);
        updateInterval = setInterval(update.bind(this), POLL_INTERVAL);
        update()
            .then(function (updated) {
                cb(null, updated);
            }, function (error) {
                cb(error);
            });
    });

    function update() {
        var deferred = Q.defer();
        request(PRIZES_URL, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                // The response we get has a tremendous amount of cruft that we just don't need. We filter that out.
                var prizes = JSON.parse(body);
                var relevantData = prizes.map(function(prize) {
                    return {
                        name: prize.fields.name,
                        provided: prize.fields.provided,
                        description: prize.fields.description,
                        image: prize.fields.image,
                        minimumbid: numeral(prize.fields.minimumbid).format('$0,0[.]00'),
                        grand: prize.fields.category === 'Grand'
                    };
                });

                if (equal(relevantData, currentPrizes.value)) {
                    nodecg.log.info('Prizes unchanged, %d active', relevantData.length);
                    deferred.resolve(false);
                } else {
                    currentPrizes.value = relevantData;
                    nodecg.log.info('Updated prizes, %d active', relevantData.length);
                    deferred.resolve(true);
                }
            } else {
                var msg = 'Could not get prizes, unknown error';
                if (error) msg = util.format('Could not get prizes:', error.message);
                else if (response) msg = util.format('Could not get prizes, response code %d', response.statusCode);
                nodecg.log.error(msg);
                deferred.reject(msg);
            }
        });
        return deferred.promise;
    }
};
