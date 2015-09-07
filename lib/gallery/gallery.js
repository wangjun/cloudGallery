'use strict';
var galleries = require('../../model/galleries');
var images = require('../../model/images');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var gallery = {};
//todo finish this function
gallery.removeOne = function (idString, cb) {
    var id = new ObjectId(idString);
    galleries.findOne({_id: id})
        .populate('images')
        .exec(function (findGalleryErr, foundGallery) {
        if(findGalleryErr){return {state: 1, err: findGalleryErr, msg: 'find gallery error'}; }
        if(foundGallery){
            var removeThisGallery = function (thisRemovedImages) {
                var removedImages = thisRemovedImages || [];
                foundGallery.remove(function (removeGalleryErr, removedGallery) {
                    if(removeGalleryErr){return {state: 4, msg: 'Remove gallery error.', err: removeGalleryErr}; }
                    return {state: 3, msg: 'Gallery removed.', removedGallery: removedGallery, removedImages: removedImages};
                });
            };
            if(foundGallery.images.length){
                foundGallery.images.forEach(function (image) {
                    var removedImages = [];
                    image.remove(function (removeImageErr, removedImage) {
                        if(removeImageErr){return {state: 6, msg: 'remove image error', err: removeImageErr}; }
                        removedImages.push(removedImage);
                        if(removedImages.length === foundGallery.images.length){
                            removeThisGallery();
                        }
                    });
                });
            }else{
                removeThisGallery();
            }
        }else{
            return {state: 2, msg: 'found no gallery.'};
        }
    });
};

gallery.verifyGalleryReq = function (req, res, next) {
    req.checkBody('title', '相册必须有名称。').notEmpty();
    req.checkBody('title', '相册名称不能少于3个字，也不能多于25个字。').isLength(2, 25);
    req.checkBody('story', '相册的故事不能为空哦，说点什么吧~').notEmpty();
    req.checkBody('story', '相册的故事至少需要十五个字哦，给大家讲点故事吧~').isLength(15, 9999);
    var errors = req.validationErrors();
    if(errors){
        errors.forEach(function (error) {
            req.flash('warning', error.msg);
        });
        res.redirect('back');
    }else{
        next();
    }
};
gallery.clean = function (req, res, jump, cb) {
    var galleryId = req.body.galleryId;
    galleries.findById(galleryId, function (findGalleryErr, foundGallery) {
        if(findGalleryErr){return jump(findGalleryErr); }
        if(foundGallery){
            var i = 1;
            foundGallery.images.forEach(function (eachImageId) {
                var response = function () {
                    if(i === foundGallery.images.length){
                        galleries.findById(galleryId, function (findResultErr, foundResult) {
                            if(findResultErr){return jump(findResultErr); }
                            if(foundResult){
                                cb(foundResult);
                            }
                        });
                    }
                    i++;
                };
                images.findById(eachImageId, function (findImageErr, foundImage) {
                    if(findImageErr){return jump(findImageErr); }
                    if(foundImage){
                        response();
                    }else{
                        galleries.findOneAndUpdate({_id: new ObjectId(galleryId)},
                            {$pull: {images: eachImageId}},
                            function (updateGalleryErr, updatedGallery) {
                                if(updateGalleryErr){return jump(updateGalleryErr); }
                                if(updatedGallery){
                                    response();
                                }
                            }
                        );
                    }

                });
            });
        }
    });
};
module.exports = gallery;
