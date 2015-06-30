var express = require('express');
var router = express.Router();
var Galleries = require('../../model/galleries');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;


router.get('/', function (req, res, next) {
    var user = req.session.user;
    if(user){
        var userObjectId = new ObjectId(user._id);
        Galleries.find({owner:userObjectId})
            .populate('thumbnail')
            .exec(function (err, galleries) {
                if(err){next(err)}
                res.render('gallery/myGallery.html',{
                    galleries:galleries
                });
            });
    }else{
        req.flash('warning', '请先登录~');
        res.redirect('/users/login');
    }
});


module.exports = router;