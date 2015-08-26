'use strict';
var Avatar = require('../../model/avatar');
var qiniu = require('qiniu');
var http = require('http');
var Stream = require('stream').Transform;
var fs = require('fs');
var path = require('path');
var user = {};
user.addAvatarByUrl = function (url, userId) {
    //get image and store into local server
    var getImage = function (cb) {
        var callback = cb || function(){};
        http.request(url, function (response) {
            var data = new Stream();
            response.on('data', function (chunk) {
                data.push(chunk);
            });
            response.on('end', function () {
                fs.writeFileSync(path.join(__dirname, '../../public/images/' + userId + '.jpg'), data.read());
                callback();
            });
        });
    };
    //upload file to qiniu cdn server
    var uploadFileToQiniu = function (localFile, key, uptoken, cb) {
        var callback = cb || function(){};

    };
};

module.exports = user;
