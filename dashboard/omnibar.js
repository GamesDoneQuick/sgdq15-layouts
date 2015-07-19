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

    $panel.find('.ctrl-gdqMonitor').click(function() {
        nodecg.sendMessage('barGDQMonitor', $panel.find('.ctrl-gdqMonitorText').val());
    });

    var bids = nodecg.Replicant('allBids').on('change', handleReplicantChanges);
    var prizes = nodecg.Replicant('allPrizes').on('change', handleReplicantChanges);

    function handleReplicantChanges() {
        if ($onDemandTypeahead.typeahead) $onDemandTypeahead.typeahead('destroy');

        // Clear the "selected" value because we can no longer trust it to be accurate.
        selected = null;
        $onDemandTypeahead.val('');

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
                source: window.bidMatcher(bids.value),
                templates: {
                    header: '<h4 class="tt-category-name">Bids</h4>',
                    suggestion: function (result) {
                        if(result.options) {
                            return [
                                '<div>',
                                    '<div class="tt-suggestion-topline">',
                                        '<span class="result-main">' + result.name + '</span>',
                                        '<span class="result-aux">' + result.total + '</span>',
                                    '</div>',
                                    '<span class="result-sub">' + result.speedrun + '</span>',
                                '</div>'
                            ].join('\n');
                        } else {
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
                }
            });
        }

        if (prizes.value) {
            args.push({
                name: 'prizes',
                displayKey: 'name',
                source: window.prizeMatcher(prizes.value),
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
