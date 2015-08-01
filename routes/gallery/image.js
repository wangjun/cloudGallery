'use strict';
var express = require('express');
var router = express.Router();
var images = require('../../model/images');
var galleries = require('../../model/galleries');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;

router.post('/save', function(req, res, next){
    var galleryId = new ObjectId(req.body.galleryId);
    var imageHash = req.body.hash;
    var imageKey = req.body.key;
    var imageName = req.body.fileName;
    galleries.findOne({_id: galleryId}, function (findGalleryErr, foundGallery) {
        if(findGalleryErr){return next(findGalleryErr); }
        if(foundGallery){
            images.findOneAndUpdate({hash: imageHash}, {$push: {belongGalleries: galleryId}}, function (findImageErr, updatedImage) {
                if(findImageErr){return next(findImageErr); }
                if(updatedImage){
                    galleries.findOneAndUpdate({_id: galleryId}, {$push: {images: updatedImage._id}}, function (updateGalleryErr, updatedGallery) {
                        if(updateGalleryErr){return next(updateGalleryErr); }
                        if(updatedGallery){
                            res.json({
                                state: 4,
                                gallery: updatedGallery,
                                msg: 'We have updated the image. Add a new gallery id to it.'
                            });
                        }else{
                            res.json({
                                state: 5,
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
                        owners: new ObjectId(req.session.user._id)
                    });
                    newImage.save(function (saveImageErr, savedImage) {
                        if(saveImageErr){return next(saveImageErr); }
                        if(savedImage){
                            galleries.findOneAndUpdate({_id: galleryId}, {$push: {images: savedImage._id}}, function (updateGalleryErr, updatedGallery) {
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
                                        state: 5,
                                        file: savedImage,
                                        msg: 'Before update this gallery. I found the gallery. But do not know why now can not find it again. ' +
                                        'At least we save the image.'
                                    });
                                }
                            });
                        }else{
                            res.json({
                                state: 3,
                                msg: 'Saved error. Can not save into database.'
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
