'use strict';
var qiniu = require('qiniu');
var images = require('../../model/images');
var galleries = require('../../model/galleries');
var logs = require('../admin/log');
var config = require('../../lib/admin/config');
var libUtility = require('../../lib/handy/utility');
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

image.removeOneFromDatabase = function(imageId, galleryId, userId, cb){
    var callback = cb || function(){};
    var imageObjectId = libUtility.isObject(imageId) ? imageId : new ObjectId(imageId);
    var galleryObjectId = libUtility.isObject(galleryId) ? galleryId : new ObjectId(galleryId);
    var userObjectId = libUtility.isObject(userId) ? userId : new ObjectId(userId);
    images.findById(imageObjectId)
        .populate('owners')
        .populate('belongGalleries')
        .exec(function (findErr, foundImage) {
            if(findErr){return findErr; }
            if(foundImage){
                var removeBelongGallery = function (removeCB) {
                    galleries.findOneAndUpdate({_id: galleryObjectId}, {
                        $pull: {
                            images: {_id: imageObjectId}
                        }
                    }, function (updateGalleryErr, updatedGallery) {
                        if(updateGalleryErr){return callback(updateGalleryErr); }
                        if(updatedGallery){
                            console.log(updatedGallery);
                            removeCB(updatedGallery);
                        }
                    });
                };
                if(foundImage.owners.length > 1){
                    images.findOneAndUpdate({_id: imageObjectId}, {
                        $pull: {
                            belongGalleries: {_id: galleryObjectId},
                            owners: {_id: userObjectId}
                        }
                    }, function (updateImageErr, updatedImage) {
                        if(updateImageErr){return callback(updateImageErr); }
                        if(updatedImage){
                            removeBelongGallery(function (updatedGallery) {
                                callback(null, updatedImage, updatedGallery);
                            });
                        }
                    });
                }else{
                    images.findOneAndRemove({_id: imageObjectId}, function (removeImageErr, removedImage) {
                        if(removeImageErr){return callback(removeImageErr); }
                        if(removedImage){
                            console.log(removedImage);
                            removeBelongGallery(function (updatedGallery) {
                                callback(null, removedImage, updatedGallery);
                            });
                        }
                    });
                }
            }
        });
};
module.exports = image;
