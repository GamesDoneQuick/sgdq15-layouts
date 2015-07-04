(function() {
    'use strict';

    var $panel = $bundle.filter('.stopwatches');
    var $stopwatches = $panel.find('.stopwatch');
    var $playPause = $panel.find('.stopwatch-ctrls-playpause');

    $playPause.on('tap', function(e) {
        var $el = $(e.target);
        if ($el.hasClass('fa-play')) {
            $el.removeClass('fa-play').addClass('fa-pause');
        } else {
            $el.removeClass('fa-pause').addClass('fa-play');
        }
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
})();
