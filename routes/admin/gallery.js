'use strict';
var express = require('express');
var Galleries = require('../../model/galleries');
var router = express.Router();

router.get('/gallery', function (req, res, next) {
    Galleries.find()
        .populate('images')
        .exec(function (findGalleriesErr, foundGalleries) {
        if(findGalleriesErr){return next(findGalleriesErr); }
        if(foundGalleries){
            res.render('admin/galleries.html', foundGalleries);
        }
    });
});

module.exports = router;
