'use strict';

module.exports = function(nodecg) {
    try {
        require('./extension/schedule')(nodecg);
    } catch (e) {
        nodecg.log.error('Failed to load "schedule" lib:', e.stack);
        process.exit(1);
    }

    try {
        require('./extension/prizes')(nodecg);
    } catch (e) {
        nodecg.log.error('Failed to load "prizes" lib:', e.stack);
        process.exit(1);
    }

    try {
        require('./extension/bids')(nodecg);
    } catch (e) {
        nodecg.log.error('Failed to load "bids" lib:', e.stack);
        process.exit(1);
    }

    try {
        require('./extension/total')(nodecg);
    } catch (e) {
        nodecg.log.error('Failed to load "total" lib:', e.stack);
        process.exit(1);
    }

    try {
        require('./extension/stopwatches')(nodecg);
    } catch (e) {
        nodecg.log.error('Failed to load "stopwatches" lib:', e.stack);
        process.exit(1);
    }
};
