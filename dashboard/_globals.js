(function() {
    'use strict';

    window.scheduleMatcher = function (schedule) {
        return function findMatches(q, cb) {
            var matches, substrRegex;

            // an array that will be populated with substring matches
            matches = [];

            // regex used to determine if a string contains the substring `q`
            substrRegex = new RegExp(q, 'i');

            // iterate through the pool of strings and for any string that
            // contains the substring `q`, add it to the `matches` array
            $.each(schedule, function (i, run) {
                if (substrRegex.test(run.game) || substrRegex.test(run.runners)) {
                    // the typeahead jQuery plugin expects suggestions to a
                    // JavaScript object, refer to typeahead docs for more info
                    matches.push(run);
                }
            });

            cb(matches);
        };
    };

    window.bidMatcher = function (bids) {
        return function findMatches(q, cb) {
            var matches, substrRegex;

            // an array that will be populated with substring matches
            matches = [];

            // regex used to determine if a string contains the substring `q`
            substrRegex = new RegExp(q, 'i');

            // iterate through the pool of strings and for any string that
            // contains the substring `q`, add it to the `matches` array
            $.each(bids, function (i, bid) {
                if (substrRegex.test(bid.speedrun) || substrRegex.test(bid.name)) {
                    matches.push(bid);
                }
            });

            cb(matches);
        };
    };

    window.prizeMatcher = function (prizes) {
        return function findMatches(q, cb) {
            var matches, substrRegex;

            // an array that will be populated with substring matches
            matches = [];

            // regex used to determine if a string contains the substring `q`
            substrRegex = new RegExp(q, 'i');

            // iterate through the pool of strings and for any string that
            // contains the substring `q`, add it to the `matches` array
            $.each(prizes, function (i, prize) {
                if (substrRegex.test(prize.name) || substrRegex.test(prize.provided)) {
                    matches.push(prize);
                }
            });

            cb(matches);
        };
    };
})();
