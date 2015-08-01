'use strict';
var qiniu = require('qiniu');
var images = require('../../model/images');
var logs = require('../../model/logs');
var config = require('../../lib/admin/config');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var image = {};
qiniu.conf.ACCESS_KEY = config.cdn.qiniu.AccessKey;
qiniu.conf.SECRET_KEY = config.cdn.qiniu.SecretKey;
var client = new qiniu.rs.Client();
image.removeOne = function(idString, cb){
    var callback = cb || function(){};
    images.findOne({_id: new ObjectId(idString)})
        .exec(function (findErr, foundImage) {
            if(findErr){return findErr; }
            client.remove(config.cdn.qiniu.BucketName, foundImage.key, function (err, ret) {

            });
        });
};

module.exports = image;
