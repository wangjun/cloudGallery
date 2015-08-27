'use strict';
var http = require('http');
var Stream = require('stream').Transform;
var fs = require('fs');
var request = {};
request.downloadImage = function (url, dest, cb) {
    var callback = cb || function(){};
    var getImageReq = http.get(url, function (response) {
        var data = new Stream();
        response.on('data', function (chunk) {
            data.push(chunk);
        });
        response.on('end', function () {
            fs.writeFileSync(dest, data.read());
            var imageType;
            switch (response.headers['content-type'] ){
                case 'image/jpeg':
                    imageType = 'jpeg';
                    break;
                case 'image/png':
                    imageType = 'png';
                    break;
                case 'image/gif':
                    imageType = 'gif';
                    break;
                case 'image/bmp':
                    imageType = 'bmp';
                    break;
            }
            callback(imageType);
        });
    });
    getImageReq.on('error', function (err) {
        console.log(err);
    });
};
module.exports = request;
