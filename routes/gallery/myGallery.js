'use strict';
var express = require('express');
var router = express.Router();
var Galleries = require('../../model/galleries');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var moment = require('moment');
var handyObject = require('../../lib/handy/object');

router.get('/', function (req, res, next) {
    var user = req.session.user;
    if(user){
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
                res.render('gallery/myGallery.html', {
                    galleries: galleries
                });
            });
    }else{
        req.flash('warning', '请先登录~');
        res.redirect('/users/login');
    }
});

module.exports = router;
