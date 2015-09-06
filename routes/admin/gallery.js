'use strict';
var express = require('express');
var Images = require('../../model/images');
var Galleries = require('../../model/galleries');
var image = require('../../lib/gallery/image');
var logs = require('../../lib/admin/log');
var router = express.Router();
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;


router.get('/', function (req, res, next) {
    Galleries.find()
        .populate('images')
        .populate('owner')
        .exec(function (findGalleriesErr, foundGalleries) {
        if(findGalleriesErr){return next(findGalleriesErr); }
        if(foundGalleries){
            foundGalleries.forEach(function (foundGallery) {
                foundGallery.images.forEach(function (foundImage) {
                    image.getState(foundImage._id);
                });
            });
            res.render('admin/galleries/galleries.html', {galleries: foundGalleries});
        }
    });
});

router.get('/remove', function (req, res, next) {
    var galleryObjectId = new ObjectId(req.query.id);
    console.log(galleryObjectId);
    Galleries.findOne({_id: galleryObjectId})
        .populate('images')
        .exec(function (findGalleryErr, foundGallery) {
            if(findGalleryErr){return next(findGalleryErr); }
            console.log(foundGallery);
            if(foundGallery.images.length){
                //todo remove image first
            }else{
                Galleries.findOneAndRemove({_id: galleryObjectId}, function (removeGalleryErr, removedGallery) {
                    if(removeGalleryErr){
                        return next(removeGalleryErr);
                    }
                    console.log(removedGallery);
                    req.flash('success', '相册删除成功！');
                    res.redirect('/admin/gallery');
                });
            }
        });
});
router.get('/:galleryId', function (req, res, jump) {
    Galleries.findById(req.params.galleryId)
        //.populate('images')
        .exec(function (findGalleryErr, foundGallery) {
        if(findGalleryErr){return jump(findGalleryErr); }
        if(foundGallery){
            var getImages = function (cb) {
                var images = [];
                foundGallery.images.forEach(function* (eachImage) {
                    yield Images.findById(eachImage)
                        .exec(function(findImageErr, foundImage) {
                            if(findImageErr){return jump(findImageErr); }
                            if(foundImage){
                                images.push(foundImage);
                            }
                        });
                });
                cb(images);
            };
            getImages(function (images) {
                res.render('admin/galleries/gallery', {
                    gallery: foundGallery,
                    title: foundGallery.title,
                    images: images
                });
            });
        }
    });
});
module.exports = router;
