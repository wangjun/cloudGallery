'use strict';
var Avatar = require('../../model/avatar');
var libQiniu = require('../qiniu/qiniu');
var qiniu = require('qiniu');
var http = require('http');
var Stream = require('stream').Transform;
var fs = require('fs');
var path = require('path');
var user = {};
user.addAvatarByUrl = function (url, userId) {
    //get image and store into local server
    var getImage = function () {
        http.request(url, function (response) {
            var data = new Stream();
            response.on('data', function (chunk) {
                data.push(chunk);
            });
            response.on('end', function () {
                var localFile = path.join(__dirname, '../../public/images/' + userId + '.jpg');
                fs.writeFileSync(localFile, data.read());
                return localFile;
            });
        });
    };
    //upload file to qiniu cdn server
    var uploadFileToQiniu = function () {
        var uptoken = libQiniu.genUptoken('LazyCoffeeAvatar');
        var extra = new qiniu.io.PutExtra();
        var localFile = getImage();
        qiniu.io.putFile(uptoken, '', localFile, extra, function (err, ret) {
            console.log(err);
            console.log(ret);
        });
    };
};

module.exports = user;
