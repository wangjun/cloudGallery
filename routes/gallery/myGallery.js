'use strict';
var express = require('express');
var router = express.Router();
var Galleries = require('../../model/galleries');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var moment = require('moment');

router.get('/', function (req, res, next) {
    var user = req.session.user;
    var userObjectId = new ObjectId(user._id);
    Galleries.find({owner: userObjectId})
        .populate('thumbnail')
        .exec(function (err, foundGalleries) {
            if(err){return next(err); }
            var galleries = [];
            for(let i = 0; i < foundGalleries.length; i++){
                var date = moment(foundGalleries[i].updateTime).format('YYYY年M月DD日');
                galleries[i] = foundGalleries[i];
                galleries[i].date = date;
            }
            res.render('gallery/myGallery', {
                galleries: galleries,
                title: '我的相册'
            });
        });
});

module.exports = router;
