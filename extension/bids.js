/* jshint -W106 */
'use strict';

var BIDS_URL = 'https://gamesdonequick.com/tracker/search/?type=bid&event=16';
var CURRENT_BIDS_URL = 'https://gamesdonequick.com/tracker/search/?type=bid&feed=current&event=16';
var POLL_INTERVAL = 3 * 60 * 1000;

var format = require('util').format;
var Q = require('q');
var request = require('request');
var equal = require('deep-equal');
var numeral = require('numeral');

module.exports = function (nodecg) {
    var currentBids = nodecg.Replicant('currentBids', {defaultValue: []});
    var allBids = nodecg.Replicant('allBids', {defaultValue: []});

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
        var currentPromise = Q.defer();
        request(CURRENT_BIDS_URL, function(err, res, body) {
            handleResponse(err, res, body, currentPromise, {
                label: 'current bids',
                replicant: currentBids
            });
        });

        var allPromise = Q.defer();
        request(BIDS_URL, function(err, res, body) {
            handleResponse(err, res, body, allPromise, {
                label: 'all bids',
                replicant: allBids
            });
        });

        return Q.all([
            currentPromise,
            allPromise
        ]);
    }

    function handleResponse(error, response, body, deferred, opts) {
        if (!error && response.statusCode === 200) {
            // The response we get has a tremendous amount of cruft that we just don't need. We filter that out.
            var bids = JSON.parse(body);
            var relevantData = bids.map(formatBid);

            if (equal(relevantData, opts.replicant.value)) {
                deferred.resolve(false);
            } else {
                opts.replicant.value = relevantData;
                deferred.resolve(true);
            }
        } else {
            var msg = format('Could not get %s, unknown error', opts.label);
            if (error) msg = format('Could not get %s:', opts.label, error.message);
            else if (response) msg = format('Could not get %s, response code %d', opts.label, response.statusCode);
            nodecg.log.error(msg);
            deferred.reject(msg);
        }
    }

    function formatBid(bid) {
        return {
            name: bid.fields.name,
            description: bid.fields.description,
            speedrun: bid.fields.speedrun__name || 'No speedgame defined', // TODO: this should not need a default
            total: numeral(bid.fields.total).format('$0,0[.]00'),
            goal: numeral(bid.fields.goal).format('$0,0[.]00')
        };
    }
};
