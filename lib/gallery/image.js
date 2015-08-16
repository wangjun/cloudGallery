'use strict';
var qiniu = require('qiniu');
var images = require('../../model/images');
var logs = require('../admin/log');
var config = require('../../lib/admin/config');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var image = {};
qiniu.conf.ACCESS_KEY = config.cdn.qiniu.AccessKey;
qiniu.conf.SECRET_KEY = config.cdn.qiniu.SecretKey;
var client = new qiniu.rs.Client();
image.getState = function (imageId) {
    var imageObjectId = typeof imageId === 'object' ? imageId : new ObjectId(imageId);
    images.findOne({_id: imageObjectId}, function (findImageErr, foundImage) {
        if(findImageErr){
            return logs.add('findImageErr', 'An error occur when finding a image in database.');
        }
        if(foundImage){
            client.stat(config.cdn.qiniu.BucketName, foundImage.key, function(err, ret) {
                if (err) {
                    console.log(err);
                    // http://developer.qiniu.com/docs/v6/api/reference/codes.html
                } else {
                    console.log(foundImage);
                    images.updateState(foundImage._id, ret.fsize, ret.hash, ret.mimeType, ret.putTime);
                    // ok
                    // ret has keys (hash, fsize, putTime, mimeType)
                }
            });
        }else{
            return logs.add('findNoImage', 'Can\'t find any image(' + imageId + ') in database');
        }
    });
};
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
