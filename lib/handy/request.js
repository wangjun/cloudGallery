'use strict';
var http = require('http');
var https = require('https');
var URI = require('URIjs');
var Stream = require('stream').Transform;
var fs = require('fs');
var request = {};
request.https = {};
request.http = {};
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
request.https.post = function (urlParsed, postData, cb) {
    var callback = cb || function(){};
    var error = null;
    var options = {
        hostname: urlParsed.hostname,
        port: 443,
        path: urlParsed.path,
        method: 'POST'
    };
    var post = https.request(options, function (response) {
        response.setEncoding('utf8');
        let data = '';
        response.on('data', function (chunk) {
            data += chunk;
        });
        response.on('end', function () {
            callback(error, JSON.parse(data));
        });
    });
    post.write(postData);
    post.on('error', function (err) {
        callback(err);
    });
};
request.post = function (url, postData, cb) {
    var urlParsed = URI.parse(url);
    switch(urlParsed.protocol){
        case 'http':
            return this.http.post(urlParsed, postData, cb);
        case 'https':
            return this.https.post(urlParsed, postData, cb);
    }
};
module.exports = request;
