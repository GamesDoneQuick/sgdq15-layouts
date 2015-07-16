(function() {
    'use strict';

    var $panel = $bundle.filter('.schedule');
    var $nextBtn = $panel.find('.js-next');
    var $prevBtn = $panel.find('.js-prev');
    var $updateGroup = $panel.find('.js-update');
    var $manualTypeahead = $panel.find('.typeahead');
    var $editModal = $('#sgdq15-layouts_editRun');
    var $runInfo = $panel.find('.runInfo');
    var $nextRun = $panel.find('.js-nextRun');

    var selectedRun = null;

    // Init tooltip(s)
    $panel.find('[data-toggle="tooltip"]').tooltip();

    var schedule = nodecg.Replicant('schedule')
        .on('change', function(oldVal, newVal) {
            // Clear the "selected" value because we can no longer trust it to be accurate.
            selectedRun = null;

            if (currentRun.value && (currentRun.value.index+1 < newVal.length)) {
                $nextRun.html(newVal[currentRun.value.index+1].game);
            } else {
                $nextRun.html('None');
            }

            if ($manualTypeahead.typeahead) $manualTypeahead.typeahead('destroy');
            $manualTypeahead.typeahead({
                    hint: true,
                    highlight: true,
                    minLength: 1
                },
                {
                    name: 'schedule',
                    displayKey: 'game',
                    source: window.scheduleMatcher(newVal),
                    templates: {
                        suggestion: function (result) {
                            return [
                                '<div>',
                                    '<div class="tt-suggestion-topline">',
                                        '<span class="result-main">' + result.game + '</span>',
                                        '<span class="result-aux">' + (result.console || '') + '</span>',
                                    '</div>',
                                    '<span class="result-sub">' + result.runners.join(', ') + '</span>',
                                '</div>'
                            ].join('\n');
                        }
                    }
                });
        });

    var currentRun = nodecg.Replicant('currentRun')
        .on('change', function(oldVal, newVal) {
            if (!newVal) return;

            $runInfo.find('.runInfo-game').text(newVal.game);
            $runInfo.find('.runInfo-console').text(newVal.console);
            $runInfo.find('.runInfo-runners').text(newVal.runners.join(', '));
            $runInfo.find('.runInfo-streamlinks').text(newVal.streamlinks.join(', '));
            $runInfo.find('.runInfo-estimate').text(newVal.estimate);
            $runInfo.find('.runInfo-category').text(newVal.category);
            $runInfo.find('.runInfo-comments').text(newVal.comments);
            $runInfo.find('.runInfo-index').text(newVal.index);

            if (schedule.value && (newVal.index+1 < schedule.value.length)) {
                $nextRun.html(schedule.value[newVal.index+1].game);
            } else {
                $nextRun.html('None');
            }

            // Disable "prev" button if at start of schedule
            $prevBtn.prop('disabled', newVal.index <= 0);

            // Disable "next" button if at end of schedule
            $nextBtn.prop('disabled', schedule.value && newVal.index >= schedule.value.length-1);
        });

    $nextBtn.click(function () {
        var nextIndex = currentRun.value.index + 1;
        currentRun.value = schedule.value[nextIndex];
    });

    $prevBtn.click(function () {
        var prevIndex = currentRun.value.index - 1;
        currentRun.value = schedule.value[prevIndex];
    });

    $updateGroup.find('button').click(function () {
        var self = this;
        $(self).prop('disabled', true);
        nodecg.sendMessage('updateSchedule', function (err, updated) {
            if (err) {
                console.error(err.message);
                showUpdateResult($updateGroup, 'danger', 'ERROR! Check console');
                return;
            }

            if (updated) {
                console.info('[sgdq15-layouts] Schedule successfully updated');
                showUpdateResult($updateGroup, 'success', 'Got updated schedule!');
            } else {
                console.info('[sgdq15-layouts] Schedule unchanged, not updated');
                showUpdateResult($updateGroup, 'default', 'Schedule unchanged, not updating');
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
    $panel.find('.js-manualBtn').click(function () {
        if (selectedRun) currentRun.value = selectedRun;
    });

    $manualTypeahead.bind('typeahead:selected', onTypeaheadSelected);
    $manualTypeahead.bind('typeahead:autocompleted', onTypeaheadSelected);

    function onTypeaheadSelected(obj, datum) {
        selectedRun = datum;
    }

    // Right before the modal is shown, populate inputs with current values.
    $editModal.on('show.bs.modal', function() {
        $editModal.find('input[name="game"]').val(currentRun.value.game);
        $editModal.find('input[name="console"]').val(currentRun.value.console);
        $editModal.find('input[name="runners"]').val(currentRun.value.runners);
        $editModal.find('input[name="streamlinks"]').val(currentRun.value.streamlinks);
        $editModal.find('input[name="category"]').val(currentRun.value.category);
        $editModal.find('input[name="estimate"]').val(currentRun.value.estimate);
    });

    $editModal.find('.js-save').click(function() {
        currentRun.value.game = $editModal.find('input[name="game"]').val();
        currentRun.value.console = $editModal.find('input[name="console"]').val();
        currentRun.value.category = $editModal.find('input[name="category"]').val();
        currentRun.value.estimate = $editModal.find('input[name="estimate"]').val();

        currentRun.value.runners = $editModal.find('input[name="runners"]').val()
            .split(',')
            .map(function(runner) {
                return runner.trim();
            });

        currentRun.value.streamlinks = $editModal.find('input[name="streamlinks"]').val().split(',')
            .map(function(streamlink) {
                return streamlink.trim();
            });
    });
})();
