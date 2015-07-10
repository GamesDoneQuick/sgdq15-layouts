(function() {
    'use strict';

    var $panel = $bundle.filter('.omnibar');
    var $onDemandTypeahead = $panel.find('.typeahead');
    var selected = null;

    $panel.find('.ctrl-send').click(function () {
        if (selected) nodecg.sendMessage('barDemand', selected);
    });

    $panel.find('.ctrl-currentBids').click(function () {
        nodecg.sendMessage('barCurrentBids', selected);
    });

    $panel.find('.ctrl-currentPrizes').click(function () {
        nodecg.sendMessage('barCurrentPrizes', selected);
    });

    $panel.find('.ctrl-upNext').click(function () {
        nodecg.sendMessage('barUpNext', selected);
    });

    $panel.find('.ctrl-cta').click(function () {
        nodecg.sendMessage('barCTA', selected);
    });

    var bidMatcher = function (bids) {
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
                    // the typeahead jQuery plugin expects suggestions to a
                    // JavaScript object, refer to typeahead docs for more info
                    matches.push({
                        type: 'bid',
                        speedrun: bid.speedrun,
                        name: bid.name,
                        total: bid.total,
                        goal: bid.goal
                    });
                }
            });

            cb(matches);
        };
    };

    var prizeMatcher = function (prizes) {
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
                    // the typeahead jQuery plugin expects suggestions to a
                    // JavaScript object, refer to typeahead docs for more info
                    matches.push({
                        type: 'prize',
                        provided: prize.provided,
                        name: prize.name,
                        minimumbid: prize.minimumbid
                    });
                }
            });

            cb(matches);
        };
    };

    var bids = nodecg.Replicant('allBids').on('change', handleReplicantChanges);
    var prizes = nodecg.Replicant('allPrizes').on('change', handleReplicantChanges);

    function handleReplicantChanges() {
        if ($onDemandTypeahead.typeahead) $onDemandTypeahead.typeahead('destroy');

        var args = [
            {
                hint: true,
                highlight: true,
                minLength: 1
            }
        ];

        if (bids.value) {
            args.push({
                name: 'bids',
                displayKey: 'name',
                source: bidMatcher(bids.value),
                templates: {
                    header: '<h4 class="tt-category-name">Bids</h4>',
                    suggestion: function (result) {
                        return [
                            '<div>',
                                '<div class="tt-suggestion-topline">',
                                    '<span class="result-main">' + result.name + '</span>',
                                    '<span class="result-aux">' + result.total + ' / ' + result.goal + '</span>',
                                '</div>',
                                '<span class="result-sub">' + result.speedrun + '</span>',
                            '</div>'
                        ].join('\n');
                    }
                }
            });
        }

        if (prizes.value) {
            args.push({
                name: 'prizes',
                displayKey: 'name',
                source: prizeMatcher(prizes.value),
                templates: {
                    header: '<h4 class="tt-category-name">Prizes</h4>',
                    suggestion: function (result) {
                        return [
                            '<div>',
                                '<div class="tt-suggestion-topline">',
                                    '<span class="result-main">' + result.name + '</span>',
                                    '<span class="result-aux">' + (result.minimumbid || '') + '</span>',
                                '</div>',
                                '<span class="result-sub">' + result.provided + '</span>',
                            '</div>'
                        ].join('\n');
                    }
                }
            });
        }

        $onDemandTypeahead.typeahead.apply($onDemandTypeahead, args);
    }

    $onDemandTypeahead.bind('typeahead:selected', onTypeaheadSelected);
    $onDemandTypeahead.bind('typeahead:autocompleted', onTypeaheadSelected);

    function onTypeaheadSelected(obj, datum) {
        selected = datum;
    }
})();
