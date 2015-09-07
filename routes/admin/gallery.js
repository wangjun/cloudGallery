'use strict';
var express = require('express');
var Images = require('../../model/images');
var Galleries = require('../../model/galleries');
var libImage = require('../../lib/gallery/image');
var libGallery = require('../../lib/gallery/gallery');
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
                res.render('admin/galleries/galleries.html', {galleries: foundGalleries});
            }
        });
});
router.post('/getState', function (req, res, jump) {
    Galleries.findById(req.body.galleryId)
        .populate('images')
        .exec(function (findGalleryErr, foundGallery) {
        foundGallery.images.forEach(function (foundImage) {
            libImage.getState(foundImage._id);
        });
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
                Images.find({_id: {$in: foundGallery.images}}, function (findImageErr, foundImages) {
                    if(findImageErr){return jump(findImageErr); }
                    res.render('admin/galleries/gallery', {
                        gallery: foundGallery,
                        title: foundGallery.title,
                        images: foundImages
                    });
                });
            }
        });
});
router.post('/clean', function (req, res, jump) {
    libGallery.clean(req, res, jump, function (arg) {
        res.json(arg);
    });
});
module.exports = router;
