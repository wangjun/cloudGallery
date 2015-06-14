var express = require('express');
var router = express.Router();
var upload = require('./upload');
var bodyParser = require('body-parser');
var Users = require('../../model/users');
var galleries = require('../../model/galleries');
var csrf = require('csurf');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;

//csrf protection
var csrfProtection = csrf({ cookie: true });
var parseForm = bodyParser.urlencoded({ extended: false });

router.use('/upload', upload);

router.get('/add', csrfProtection, function (req, res) {
    var user = req.session.user;
    if(user){
        res.render('gallery/add.html',{
            csrfToken:req.csrfToken()
        });
    }else{
        req.flash('warning', '请先登录');
        req.session.backTo = '/gallery/add';
        res.redirect('/users/login');
    }
});

router.post('/add', parseForm, csrfProtection, function (req, res, next) {
    var title = req.body.title;
    var story = req.body.story;
    var user = req.session.user;
    var userObjectId = new ObjectId(user._id);
    req.checkBody('title','相册必须有名称。').notEmpty();
    req.checkBody('title', '相册名称不能少于3个字，也不能多于25个字。').isLength(2, 25);
    req.checkBody('story', '相册的故事不能为空哦，说点什么吧~').notEmpty();
    req.checkBody('story', '相册的故事至少需要十五个字哦，给大家讲点故事吧~').isLength(15,9999);
    var errors = req.validationErrors();
    if(user){
        if(errors){
            errors.forEach(function(error){
                req.flash('warning', error.msg);
            });
            res.redirect('/gallery/add');
        }else{
            var newGallery = new galleries({
                title : title,
                story : story,
                owner : userObjectId
            });
            newGallery.save(function (err, gallery) {
                if(err){next(err);}
                Users.findOneAndUpdate({_id:userObjectId}, {$push:{galleries:gallery._id}}, {new:true},
                    function(err, result){
                        if(err){next(err);}
                        req.flash('success', '成功创建新相册~');
                        var newGalleryUrl = '/gallery/'+user._id+'/'+gallery._id.toHexString();
                        res.redirect(newGalleryUrl);
                });
            });
        }
    }else{
        req.session.backTo = '/gallery/add';
        req.flash('warning', '请先登录');
        res.redirect('/users/login');
    }
});

//按用户查找相册
router.get('/:userId/:galleryId', function (req, res, next) {
    var userObjectId = new ObjectId(req.params.userId);
    var galleryObjectId = new ObjectId(req.params.galleryId);
    var queryUser = Users.where({_id:userObjectId});
    queryUser.findOne(function(err, user){
        if(err){next(err);}
        if(user){
            var queryGallery = galleries.where({_id:galleryObjectId});
            queryGallery.findOne(function(err, gallery){
                if(err){next(err);}
                if(gallery){
                    res.render('gallery/gallery.html',{
                        gallery:gallery
                    });
                }else{
                    req.flash('warning', '找不到该相册');
                    res.redirect('back');
                }

            });
        }else{
            console.log('no user found');
            req.flash('warning', '找不到该相册');
            res.redirect('back');
        }
    });
    console.log(req.params);
});

module.exports = router;