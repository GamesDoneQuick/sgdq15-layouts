(function () {
    'use strict';

    var $panel = $bundle.filter('.advertisements');
    var $images = $panel.find('#sgdq-ad-images');
    var $videos = $panel.find('#sgdq-ad-videos');
    var $ftb = $panel.find('.ctrl-ftb');

    // Matty asked for the ability to see how much time is left in an image advertisement's display duration.
    // This mess of code does that.
    var fadeInTimeout, imageCountdownInterval, fadeOutTimeout;
    var startImageCountdown = function() {
        var time = 30;
        clearTimeout(fadeInTimeout);
        clearInterval(imageCountdownInterval);
        clearTimeout(fadeOutTimeout);

        $('#sgdq-adImage-status').html('Fading in...');
        fadeInTimeout = setTimeout(function() {
            doShowTime();
            imageCountdownInterval = setInterval(doShowTime, 1000);
        }, 500);

        function doShowTime() {
            if (time <= 0) {
                clearInterval(imageCountdownInterval);
                $('#sgdq-adImage-status').html('Fading out...');
                fadeOutTimeout = setTimeout(function () {
                    $('#sgdq-adImage-status').html('');
                }, 500);
            } else {
                $('#sgdq-adImage-status').html(time + ' seconds remaining');
                time--;
            }
        }
    };

    nodecg.Replicant('adImages')
        .on('change', function (oldVal, newVal) {
            $images.html('');
            newVal.forEach(function (adImage) {
                var div = document.createElement('div');
                div.classList.add('ad');
                div.setAttribute('data-url', adImage.url);

                var span = document.createElement('span');
                span.classList.add('ad-filename');
                span.innerHTML = adImage.filename;
                span.setAttribute('title', adImage.filename);
                div.appendChild(span);

                var button = document.createElement('button');
                button.classList.add('ad-play');
                button.innerHTML = '<i class="fa fa-play"></i>';
                button.addEventListener('click', function() {
                    var url = this.parentNode.getAttribute('data-url');
                    nodecg.sendMessage('showAdImage', url);
                    startImageCountdown();
                }, false);

                div.appendChild(button);
                $images.append(div);
            });
        });

    nodecg.Replicant('adVideos')
        .on('change', function (oldVal, newVal) {
            $videos.html('');
            newVal.forEach(function (adVideo) {
                var div = document.createElement('div');
                div.classList.add('ad');
                div.setAttribute('data-url', adVideo.url);

                var span = document.createElement('span');
                span.classList.add('ad-filename');
                span.innerHTML = adVideo.filename;
                span.setAttribute('title', adVideo.filename);
                div.appendChild(span);

                var button = document.createElement('button');
                button.classList.add('ad-play');
                button.innerHTML = '<i class="fa fa-play"></i>';
                button.addEventListener('click', function() {
                    var url = this.parentNode.getAttribute('data-url');
                    nodecg.sendMessage('playAdVideo', url);
                }, false);

                if (!ftb.value) {
                    button.setAttribute('disabled', true);
                    button.setAttribute('title', 'Fade to black before playing a video!');
                }

                div.appendChild(button);
                $videos.append(div);
            });
        });

    var ftb = nodecg.Replicant('ftb', {defaultValue: false})
        .on('change', function(oldVal, newVal) {
            var $videoPlayButtons = $panel.find('#sgdq-ad-videos .ad-play');

            if (newVal) {
                $ftb.addClass('btn-danger');
                $ftb.addClass('faded');
                $videoPlayButtons
                    .attr('disabled', false)
                    .attr('title', '');
            } else {
                $ftb.removeClass('btn-danger');
                $ftb.removeClass('faded');
                $videoPlayButtons
                    .attr('disabled', true)
                    .attr('title', 'Fade to black before playing a video!');
            }
        });

    $ftb.click(function() {
        ftb.value = !ftb.value;
    });

    // Provide a button to immediately hide any displaying ad image.
    var handleHideAdImage = function() {
        clearTimeout(fadeInTimeout);
        clearInterval(imageCountdownInterval);
        clearTimeout(fadeOutTimeout);
        $('#sgdq-adImage-status').html('');
    };

    $panel.find('.ctrl-hideImage').click(function() {
        nodecg.sendMessage('hideAdImage');
        handleHideAdImage();
    });

    nodecg.listenFor('hideAdImage', handleHideAdImage);

    // Provide a button to immediately stop any playing ad video.
    $panel.find('.ctrl-stopVideo').click(function() {
        nodecg.sendMessage('stopAdVideo');
    });

    // Handle load progress reports from the view
    nodecg.listenFor('adLoadProgress', function(data) {
        var $play = $panel
            .find('.ad')
            .filter(function() {
                return $(this).data('url') === data.url;
            })
            .find('.ad-play');

        if (data.status === 'loading') {
            $play.attr('disabled', true);
            $play.html(data.progress);
        } else {
            if (data.type === 'image') startImageCountdown();
            $play.attr('disabled', false);
            $play.html('<i class="fa fa-play"></i>');
        }
    });
})();
