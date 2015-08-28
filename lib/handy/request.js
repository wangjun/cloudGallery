'use strict';
var http = require('http');
var https = require('https');
var URI = require('URIjs');
var Stream = require('stream').Transform;
var fs = require('fs');
var request = {};
request.downloadImage = function (url, dest, cb) {
    var callback = cb || function(){};
    var getImageReq = http.get(url, function (response) {
        let data = new Stream();
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
request.https.post = function (url, data, cb) {
    var callback = cb || function(){};
    var urlArray = url.split('/');
    var hostName = urlArray[0];
    var path = urlArray.splice(0, 1).join();
    var options = {
        hostname: hostName,
        port: 443,
        path: path,
        method: 'POST'
    };
    var post = https.request(options, function (response) {
        let data = '';
        response.on('data', function (chunk) {
            data += chunk;
        });
        response.on('end', function () {
            callback(JSON.parse(data));
        });
    });
    post.on('error', function (err) {
        return err;
    });
};
module.exports = request;
