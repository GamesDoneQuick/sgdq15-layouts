'use strict';

var chokidar = require('chokidar');
var path = require('path');
var fs = require('fs');
var ADVERTISEMENTS_PATH = path.resolve(__dirname, '../view/advertisements');
var BASE_URL = '/view/sgdq15-layouts/advertisements/';
var IMAGE_EXTS = ['.png', '.jpg'];
var VIDEO_EXTS = ['.webm'];

module.exports = function(nodecg) {
    nodecg.log.info('Monitoring "%s" for changes to advertisement assets...', ADVERTISEMENTS_PATH);

    var adVideos = nodecg.Replicant('adVideos');
    var adImages = nodecg.Replicant('adImages');

    var watcher = chokidar.watch([
        ADVERTISEMENTS_PATH + '/*.png',
        ADVERTISEMENTS_PATH + '/*.jpg',
        ADVERTISEMENTS_PATH + '/*.webm'
    ],{
        ignored: /[\/\\]\./,
        persistent: true,
        ignoreInitial: true,
        usePolling: true // Non-polling is really buggy for us right now.
    });

    watcher.on('add', reloadAdvertisements);
    watcher.on('change', reloadAdvertisements);
    watcher.on('unlink', reloadAdvertisements);
    watcher.on('error', function(e) {
        nodecg.error(e.stack);
    });

    // Initialize
    reloadAdvertisements();

    // On changed/added/deleted
    function reloadAdvertisements(filename) {
        if (filename) {
            nodecg.log.info('Advertisement "%s" changed, reloading all advertisements...', path.basename(filename));
        }

        // Arrays with URLs pointing to the images and videos, respectively
        var imageUrls = [];
        var videoUrls = [];

        // Scan the images dir
        var adsDir = fs.readdirSync(ADVERTISEMENTS_PATH);
        adsDir.forEach(function(ad) {
            var ext = path.extname(ad);
            if (isImage(ext)) {
                imageUrls.push({
                    url: BASE_URL + ad,
                    filename: ad,
                    type: 'image'
                });
            } else if (isVideo(ext)) {
                videoUrls.push({
                    url: BASE_URL + ad,
                    filename: ad,
                    type: 'video'
                });
            }
        });

        // Overwrite the replicants
        adImages.value = imageUrls;
        adVideos.value = videoUrls;
    }
};

function isImage(ext) {
    return IMAGE_EXTS.indexOf(ext) >= 0;
}

function isVideo(ext) {
    return VIDEO_EXTS.indexOf(ext) >= 0;
}
