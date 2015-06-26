/* jshint -W106 */
'use strict';

// The list of currently active bids can be retrieved from this url
var BIDS_URL = 'https://gamesdonequick.com/tracker/search/?type=bid&feed=current';
var POLL_INTERVAL = 3 * 60 * 1000;

var util = require('util');
var Q = require('q');
var request = require('request');
var equal = require('deep-equal');
var numeral = require('numeral');

module.exports = function (nodecg) {
    var currentBids = nodecg.Replicant('currentBids', {defaultValue: []});

    // Get initial data
    update();

    // Get latest bid data every POLL_INTERVAL milliseconds
    nodecg.log.info('Polling bids every %d seconds...', POLL_INTERVAL / 1000);
    var updateInterval = setInterval(update.bind(this), POLL_INTERVAL);

    // Dashboard can invoke manual updates
    nodecg.listenFor('updateBids', function(data, cb) {
        nodecg.log.info('Manual bid update button pressed, invoking update...');
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
        request(BIDS_URL, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                // The response we get has a tremendous amount of cruft that we just don't need. We filter that out.
                var bids = JSON.parse(body);
                var relevantData = bids.map(function(bid) {
                    return {
                        name: bid.fields.name,
                        description: bid.fields.description,
                        speedrun: bid.fields.speedrun__name || 'No speedgame defined', // TODO: this should not need a default
                        total: numeral(bid.fields.total).format('$0,0[.]00'),
                        goal: numeral(bid.fields.goal).format('$0,0[.]00')
                    };
                });

                if (equal(relevantData, currentBids.value)) {
                    nodecg.log.info('Bids unchanged, %d active', relevantData.length);
                    deferred.resolve(false);
                } else {
                    currentBids.value = relevantData;
                    nodecg.log.info('Updated bids, %d active', relevantData.length);
                    deferred.resolve(true);
                }
            } else {
                var msg = 'Could not get bids, unknown error';
                if (error) msg = util.format('Could not get bids:', error.message);
                else if (response) msg = util.format('Could not get bids, response code %d', response.statusCode);
                nodecg.log.error(msg);
                deferred.reject(msg);
            }
        });
        return deferred.promise;
    }
};
