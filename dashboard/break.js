(function() {
    'use strict';

    var $panel = $bundle.filter('.break');
    var $onDemandTypeahead = $panel.find('.typeahead');
    var selected = null;

    $panel.find('.ctrl-send').click(function () {
        if (selected) nodecg.sendMessage('breakDemand', selected);
    });

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
                    prize.type = 'prize';
                    matches.push(prize);
                }
            });

            cb(matches);
        };
    };

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
