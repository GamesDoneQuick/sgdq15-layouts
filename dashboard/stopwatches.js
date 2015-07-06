(function() {
    'use strict';

    var $panel = $bundle.filter('.stopwatches');
    var $playAll = $panel.find('button[name="playAll"]');
    var $pauseAll = $panel.find('button[name="pauseAll"]');
    var $resetAll = $panel.find('button[name="resetAll"]');

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
