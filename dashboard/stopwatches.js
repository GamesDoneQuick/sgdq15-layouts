(function() {
    'use strict';

    var $panel = $bundle.filter('.stopwatches');
    var $stopwatches = $panel.find('.stopwatch');
    var $playPause = $panel.find('.stopwatch-ctrls-playpause');
    var $reset = $panel.find('.stopwatch-ctrls-reset');
    var $playAll = $panel.find('button[name="playAll"]');
    var $pauseAll = $panel.find('button[name="pauseAll"]');
    var $resetAll = $panel.find('button[name="resetAll"]');

    $playPause.on('click', function(e) {
        var $el = $(e.target);
        var $stopwatch = $el.closest('.stopwatch');
        if ($el.hasClass('fa-play')) {
            nodecg.sendMessage('startTime', $stopwatches.index($stopwatch));
        } else {
            nodecg.sendMessage('pauseTime', $stopwatches.index($stopwatch));
        }
    });

    $reset.click(function(e) {
        var $el = $(e.target);
        var $stopwatch = $el.closest('.stopwatch');
        nodecg.sendMessage('resetTime', $stopwatches.index($stopwatch));
    });

    nodecg.Replicant('stopwatches')
        .on('change', function(oldVal, newVal) {
            newVal.forEach(function(sw, idx) {
                var $stopwatch = $($stopwatches[idx]);
                $stopwatch.find('.stopwatch-status-time').html(sw.time);

                var $playPause = $stopwatch.find('.stopwatch-ctrls-playpause');
                if (sw.state === 'running') {
                    $playPause.removeClass('fa-play').addClass('fa-pause');
                } else {
                    $playPause.removeClass('fa-pause').addClass('fa-play');
                }
            });
        });

    var currentRun = nodecg.Replicant('currentRun')
        .on('change', function(oldVal, newVal) {
            $stopwatches.hide();

            newVal.runners.forEach(function(runner, idx) {
                var $stopwatch = $($stopwatches[idx]);
                $stopwatch.show();
                $stopwatch.find('.stopwatch-status-runner').html(runner);
            });
        });

    $playAll.click(function() {
        nodecg.sendMessage('startTime', 'all');
    });

    $pauseAll.click(function() {
        nodecg.sendMessage('pauseTime', 'all');
    });

    $resetAll.click(function() {
        nodecg.sendMessage('resetTime', 'all');
    });
})();
