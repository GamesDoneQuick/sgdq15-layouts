(function() {
    'use strict';

    var panel = $bundle.filter('.schedule');
    var nextBtn = panel.find('.js-next');
    var prevBtn = panel.find('.js-prev');
    var updateGroup = panel.find('.js-update');
    var updateBtn = updateGroup.find('button');
    var manualTypeahead = panel.find('.typeahead');
    var manualBtn = panel.find('.js-manualBtn');
    var editModal = $('#sgdq15-layouts_editRun');

    var runInfo = panel.find('.runInfo');
    var runInfoGame = runInfo.find('.runInfo-game');
    var runInfoConsole = runInfo.find('.runInfo-console');
    var runInfoRunners = runInfo.find('.runInfo-runners');
    var runInfoStreamlinks = runInfo.find('.runInfo-streamlinks');
    var runInfoEstimate = runInfo.find('.runInfo-estimate');
    var runInfoCategory = runInfo.find('.runInfo-category');
    var runInfoComments = runInfo.find('.runInfo-comments');
    var runInfoIndex = runInfo.find('.runInfo-index');
    var nextRun = panel.find('.js-nextRun');

    // Init tooltip(s)
    panel.find('[data-toggle="tooltip"]').tooltip();

    var schedule = nodecg.Replicant('schedule')
        .on('change', function(oldVal, newVal) {
            if (currentRun.value && (currentRun.value.index+1 < newVal.length)) {
                nextRun.html(newVal[currentRun.value.index+1].game);
            } else {
                nextRun.html('None');
            }

            // TODO: I'm, unsure if re-making the typeahead each time is necessary
            if (manualTypeahead.typeahead) manualTypeahead.typeahead('destroy');
            manualTypeahead.typeahead({
                    hint: true,
                    highlight: true,
                    minLength: 1
                },
                {
                    name: 'schedule',
                    limit: 10,
                    displayKey: 'game',
                    source: substringMatcher(newVal),
                    templates: {
                        suggestion: function (result) {
                            return [
                                '<div>',
                                    '<div class="tt-suggestion-topline">',
                                        '<span class="run-console">' + (result.console || '') + '</span>',
                                        '<span class="run-game">' + result.game + '</span>',
                                    '</div>',
                                    '<span class="run-runners">' + result.runners.join(', ') + '</span>',
                                '</div>'
                            ].join('\n');
                        }
                    }
                });
        });

    var currentRun = nodecg.Replicant('currentRun')
        .on('change', function(oldVal, newVal) {
            if (!newVal) return;

            runInfoGame.find('.form-control-static').text(newVal.game);
            runInfoConsole.find('.form-control-static').text(newVal.console);
            runInfoRunners.find('.form-control-static').text(newVal.runners.join(', '));
            runInfoStreamlinks.find('.form-control-static').text(newVal.streamlinks.join(', '));
            runInfoEstimate.find('.form-control-static').text(newVal.estimate);
            runInfoCategory.find('.form-control-static').text(newVal.category);
            runInfoComments.find('.form-control-static').text(newVal.comments);
            runInfoIndex.find('.form-control-static').text(newVal.index);

            if (schedule.value && (newVal.index+1 < schedule.value.length)) {
                nextRun.html(schedule.value[newVal.index+1].game);
            } else {
                nextRun.html('None');
            }

            // Disable "prev" button if at start of schedule
            prevBtn.prop('disabled', newVal.index <= 0);

            // Disable "next" button if at end of schedule
            nextBtn.prop('disabled', schedule.value && newVal.index >= schedule.value.length-1);
        });

    nextBtn.click(function () {
        var nextIndex = currentRun.value.index + 1;
        currentRun.value = schedule.value[nextIndex];
    });
    prevBtn.click(function () {
        var prevIndex = currentRun.value.index - 1;
        currentRun.value = schedule.value[prevIndex];
    });
    updateBtn.click(function () {
        var self = this;
        $(self).prop('disabled', true);
        nodecg.sendMessage('updateSchedule', function (err, updated) {
            if (err) {
                console.error(err.message);
                showUpdateResult(updateGroup, 'danger', 'ERROR! Check console');
                return;
            }

            if (updated) {
                console.info('[sgdq15-layouts] Schedule successfully updated');
                showUpdateResult(updateGroup, 'success', 'Got updated schedule!');
            } else {
                console.info('[sgdq15-layouts] Schedule unchanged, not updated');
                showUpdateResult(updateGroup, 'default', 'Schedule unchanged, not updating');
            }
        });
    });

    function showUpdateResult(el, type, msg) {
        var resultEl = el.find('.updateResult-' + type);

        if (resultEl.hasClass('updateResult-show')) {
            console.warn('[sgdq15-layouts] Tried to show multiple update results at once for element:', el);
            return;
        }

        var btn = el.find('button');
        resultEl.html(msg).addClass('updateResult-show');
        setTimeout(function () {
            btn.prop('disabled', false);
            resultEl.removeClass('updateResult-show');
        }, 4000);
    }

    /* Typeahead */
    var substringMatcher = function (schedule) {
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
                    matches.push({game: run.game, runners: run.runners, console: run.console, index: run.index});
                }
            });

            cb(matches);
        };
    };

    manualBtn.click(function () {
        var runIndex = manualTypeahead.data('runIndex');
        if (typeof(runIndex) !== 'number') return;
        currentRun.value = schedule.value[runIndex];
        manualTypeahead.data('runIndex', null);
    });

    manualTypeahead.bind('typeahead:selected', onTypeaheadSelected);
    manualTypeahead.bind('typeahead:autocompleted', onTypeaheadSelected);

    function onTypeaheadSelected(obj, datum) {
        // Add the currently selected run's index as a data prop
        manualTypeahead.data('runIndex', datum.index);
    }

    //triggered when modal is about to be shown
    editModal.on('show.bs.modal', function() {
        // Populate inputs with current values
        editModal.find('input[name="game"]').val(currentRun.value.game);
        editModal.find('input[name="console"]').val(currentRun.value.console);
        editModal.find('input[name="runners"]').val(currentRun.value.runners);
        editModal.find('input[name="streamlinks"]').val(currentRun.value.streamlinks);
        editModal.find('input[name="category"]').val(currentRun.value.category);
        editModal.find('input[name="estimate"]').val(currentRun.value.estimate);
    });

    editModal.find('.js-save').click(function() {
        currentRun.value.game = editModal.find('input[name="game"]').val();
        currentRun.value.console = editModal.find('input[name="console"]').val();
        currentRun.value.category = editModal.find('input[name="category"]').val();
        currentRun.value.estimate = editModal.find('input[name="estimate"]').val();

        currentRun.value.runners = editModal.find('input[name="runners"]').val()
            .split(',')
            .map(function(runner) {
                return runner.trim();
            });

        currentRun.value.streamlinks = editModal.find('input[name="streamlinks"]').val().split(',')
            .map(function(streamlink) {
                return streamlink.trim();
            });
    });
})();
