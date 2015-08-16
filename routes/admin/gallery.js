'use strict';
var express = require('express');
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
            if(findGalleryErr){return logs.add('err', JSON.stringify(findGalleryErr), 'remove gallery, find gallery error'); }
            console.log(foundGallery);
            if(foundGallery.images.length){
                //todo remove image first
            }else{
                Galleries.findOneAndRemove({_id: galleryObjectId}, function (removeGalleryErr, removedGallery) {
                    if(removeGalleryErr){
                        return logs.add('err', JSON.stringify(removeGalleryErr), 'remove gallery, remove gallery error');
                    }
                    console.log(removedGallery);
                    req.flash('success', '相册删除成功！');
                    res.redirect('/admin/gallery');
                });
            }
        });
});
module.exports = router;
