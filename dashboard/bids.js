(function() {
    'use strict';

    var $panel = $bundle.filter('.bids');
    var $bidsTable = $panel.find('table');
    var $updateGroup = $panel.find('.js-update');

    nodecg.Replicant('currentBids')
        .on('change', function(oldVal, newVal) {
            var html = '';
            newVal.forEach(function(bid) {
                html += '<tr><td>' + bid.name + '</td>' +
                    '<td>' + bid.description + '</td>' +
                    '<td>' + bid.total + '</td></tr>';
            });
            $bidsTable.find('tbody').html(html);
        });

    $updateGroup.find('button').click(function () {
        var self = this;
        $(self).prop('disabled', true);
        nodecg.sendMessage('updateBids', function (err, updated) {
            if (err) {
                console.error(err.message);
                showUpdateResult($updateGroup, 'danger', 'ERROR! Check console');
                return;
            }

            if (updated) {
                console.info('[sgdq15-layouts] Bids successfully updated');
                showUpdateResult($updateGroup, 'success', 'Got current bids!');
            } else {
                console.info('[sgdq15-layouts] Bids unchanged, not updating');
                showUpdateResult($updateGroup, 'default', 'Bids unchanged, not updating');
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
})();
