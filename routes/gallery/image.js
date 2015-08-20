'use strict';
var express = require('express');
var router = express.Router();
var images = require('../../model/images');
var galleries = require('../../model/galleries');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var moment = require('moment');

router.post('/save', function(req, res, next){
    var galleryId = new ObjectId(req.body.galleryId);
    var imageHash = req.body.hash;
    var imageKey = req.body.key;
    var imageName = req.body.fileName;
    var imageDate = moment(req.body.date, 'YYYY:MM:DD HH:mm:ss').toDate();
    console.log(imageDate);
    var isImageExist = false;
    galleries.findOne({_id: galleryId})
        .populate('images')
        .exec(function (findGalleryErr, foundGallery) {
        if(findGalleryErr){return next(findGalleryErr); }
        if(foundGallery){
            let searchImage = function (cb){
                foundGallery.images.forEach(function (image) {
                    if(image.hash === imageHash){
                        isImageExist = true;
                    }
                });
                cb(isImageExist);
            };
            searchImage(function (isExit) {
                if(isExit){
                    res.json({
                        state: 5,
                        gallery: foundGallery,
                        msg: 'Image has already exist in this gallery. No need to update anything.'
                    });
                }else{
                    images.findOneAndUpdate({hash: imageHash}, {$addToSet: {belongGalleries: galleryId}}, function (findImageErr, updatedImage) {
                        if(findImageErr){return next(findImageErr); }
                        if(updatedImage){
                            galleries.findOneAndUpdate({_id: galleryId}, {$addToSet: {images: updatedImage._id}}, function (updateGalleryErr, updatedGallery) {
                                if(updateGalleryErr){return next(updateGalleryErr); }
                                if(updatedGallery){
                                    res.json({
                                        state: 4,
                                        image: updatedImage,
                                        gallery: foundGallery,
                                        msg: 'Someone have uploaded the image before. Add a new gallery id to it.'
                                    });
                                }else{
                                    res.json({
                                        state: 6,
                                        msg: 'Before update this gallery. I found the gallery. But do not know why now can not find it again.'
                                    });
                                }
                            });
                        }else{
                            var newImage = new images({
                                hash: imageHash,
                                key: imageKey,
                                fileName: imageName,
                                belongGalleries: galleryId,
                                owners: new ObjectId(req.session.user._id),
                                exif: {DateTime: imageDate}
                            });
                            newImage.save(function (saveImageErr, savedImage) {
                                if(saveImageErr){return next(saveImageErr); }
                                if(savedImage){
                                    galleries.findOneAndUpdate({_id: galleryId}, {$addToSet: {images: savedImage._id}}, function (updateGalleryErr, updatedGallery) {
                                        if(updateGalleryErr){return next(updateGalleryErr); }
                                        if(updatedGallery){
                                            res.json({
                                                state: 2,
                                                file: savedImage,
                                                gallery: updatedGallery,
                                                msg: 'New image saved in database.Add image to the gallery. Image add a new belongGallery.'
                                            });
                                        }else{
                                            res.json({
                                                state: 7,
                                                file: savedImage,
                                                msg: 'Before update this gallery. I found the gallery. But do not know why now can not find it again. ' +
                                                'At least we save the image.'
                                            });
                                        }
                                    });
                                }else{
                                    res.json({
                                        state: 3,
                                        msg: 'Saved image error. Can not save into database.'
                                    });
                                }
                            });

                        }
                    });
                }
            });
        }else{
            res.json({
                state: 1,
                msg: 'Found no gallery.'
            });
        }
    });
});

module.exports = router;
