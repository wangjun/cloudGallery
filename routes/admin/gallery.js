'use strict';
var express = require('express');
var Galleries = require('../../model/galleries');
var image = require('../../lib/gallery/image');
var router = express.Router();

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

module.exports = router;
