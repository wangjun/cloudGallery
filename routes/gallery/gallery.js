'use strict';
var express = require('express');
var router = express.Router();
var upload = require('./upload');
var bodyParser = require('body-parser');
var Users = require('../../model/users');
var Galleries = require('../../model/galleries');
var Images = require('../../model/images');
var csrf = require('csurf');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var config = require('../../lib/admin/config');
var qiniu = require('qiniu');

//csrf protection
var csrfProtection = csrf({cookie: true});
var parseForm = bodyParser.urlencoded({extended: false});

router.use('/upload', upload);

router.get('/add', csrfProtection, function (req, res) {
    var user = req.session.user;
    if (user) {
        res.render('gallery/add.html', {
            csrfToken: req.csrfToken()
        });
    } else {
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
    req.checkBody('title', '相册必须有名称。').notEmpty();
    req.checkBody('title', '相册名称不能少于3个字，也不能多于25个字。').isLength(2, 25);
    req.checkBody('story', '相册的故事不能为空哦，说点什么吧~').notEmpty();
    req.checkBody('story', '相册的故事至少需要十五个字哦，给大家讲点故事吧~').isLength(15, 9999);
    var errors = req.validationErrors();
    if (user) {
        if (errors) {
            errors.forEach(function (error) {
                req.flash('warning', error.msg);
            });
            res.redirect('/gallery/add');
        } else {
            var newGallery = new Galleries({
                title: title,
                story: story,
                owner: userObjectId
            });
            newGallery.save(function (saveGalleryErr, gallery) {
                if (saveGalleryErr) {return next(saveGalleryErr); }
                Users.findOneAndUpdate({_id: userObjectId}, {$push: {galleries: gallery._id}}, {new: true},
                    function (findUserErr, result) {
                        if (findUserErr) {return next(findUserErr); }
                        req.flash('success', '成功创建新相册~');
                        var newGalleryUrl = '/gallery/' + result._id.toHexString();
                        res.redirect(newGalleryUrl);
                    });
            });
        }
    } else {
        req.session.backTo = '/gallery/add';
        req.flash('warning', '请先登录');
        res.redirect('/users/login');
    }
});

//按相册ID查找相册
router.get('/:galleryId', function (req, res, next) {
    var galleryId = req.params.galleryId;
    var galleryObjectId = new ObjectId(galleryId);
    Galleries.findOne({_id: galleryObjectId})
        .populate('images')
        .exec(function (err, gallery) {
            if (err) {return next(err); }
            if (gallery) {
                res.render('gallery/gallery.html', {
                    gallery: gallery
                });
            } else {
                req.flash('warning', '找不到该相册');
                res.redirect('back');
            }
        });
});


//保存图片
router.post('/save-image', function (req, res, next) {
    var hash = req.body.hash;
    var key = req.body.key;
    var fileName = req.body.fileName;
    var galleryId = req.body.galleryId;
    var user = req.session.user;
    if (user) {
        var userObjectId = new ObjectId(user._id);
        var galleryObjectId = new ObjectId(galleryId);
        Galleries.findOne({_id: galleryObjectId})
            .populate('owner')
            .exec(function (findGalleryErr, gallery) {
                if (findGalleryErr) {
                    return next(findGalleryErr);
                }
                if (gallery == null) {
                    res.json({
                        state: 1,
                        status: '没有找到该相册'
                    });
                } else if (gallery.owner._id.toHexString() === user._id) {
                    var updateGallery = function (formalGalleryObjectId, image, status) {
                        if (gallery.images.indexOf(image._id) === -1) {
                            Galleries.findOneAndUpdate(
                                {_id: formalGalleryObjectId},
                                {$push: {images: image._id}},
                                {new: true},
                                function (err, result) {
                                    if (err) {
                                        return next(err);
                                    }
                                    if (status === 1) {
                                        res.json({
                                            state: 3,
                                            status: '该图片已存在，不必再上传，但保存了图片与相册之间的关系。',
                                            image: image,
                                            gallery: result
                                        });
                                    } else if (status === 2) {
                                        res.json({
                                            state: 4,
                                            status: '图片上传成功，并保存与相册之间的关系。',
                                            image: image,
                                            gallery: result
                                        });
                                    }

                                }
                            );
                        } else {
                            res.json({
                                state: 5,
                                status: '该图片已存在，不必再上传，而且当前相册也有此图片，不必更新。',
                                image: image,
                                gallery: gallery
                            });
                        }
                    };

                    Images.findOneAndUpdate(
                        {hash: hash},
                        {$push: {belongGalleries: gallery._id, owners: userObjectId}},
                        {new: true},
                        function (updateImageErr, result) {
                            if (updateImageErr) {
                                return next(updateImageErr);
                            }
                            if (result) {
                                updateGallery(galleryObjectId, result, 1);
                            } else {
                                var newImage = new Images({
                                    hash: hash,
                                    key: key,
                                    fileName: fileName,
                                    belongGalleries: galleryObjectId,
                                    owners: userObjectId
                                });
                                newImage.save(function (err, saveResult) {
                                    if (err) {
                                        return next(err);
                                    }
                                    updateGallery(galleryObjectId, saveResult, 2);
                                });
                            }
                        }
                    );
                } else {
                    res.json({
                        state: 2,
                        status: '这不是你的相册哦。'
                    });
                }
            });
    } else {
        req.flash('warning', '请先登陆~');
        res.redirect('/users/login');
    }

});

//删除照片
router.post('/remove-image', function (req, res, next) {
    var user = req.session.user;
    qiniu.conf.ACCESS_KEY = config.cdn.AccessKey;
    qiniu.conf.SECRET_KEY = config.cdn.SecretKey;
    if (user) {
        var hash = req.body.hash;
        Images.findOneAndRemove({hash: hash})
            .exec(function (findImageErr, image) {
                if (findImageErr) {
                    return next(findImageErr);
                }
                var client = new qiniu.rs.Client();
                if (image) {
                    client.remove(config.cdn.BucketName, image.key, function (err, ret) {
                        var returnData = {};
                        returnData.image = image;
                        if (err) {
                            let situation1 = function* () {
                                returnData.state = 2;
                                returnData.status = '照片已从数据库中删除，但ＣＤＮ上删除失败，具体原因请查看控制台。';
                                returnData.err = err;
                                returnData.ret = ret;
                                console.log(returnData);
                                console.log(err);
                                console.log(ret);
                                yield res.json(returnData);
                            };
                            situation1().next();
                            // http://developer.qiniu.com/docs/v6/api/reference/codes.html
                        } else {
                            // ok
                            let situation2 = function* () {
                                returnData.state = 4;
                                returnData.status = '数据库和ＣＤＮ都已把照片删除。';
                                yield res.json(returnData);
                            };
                            situation2().next();
                        }
                    });
                } else {
                    //数据库没有此照片
                    client.remove(config.cdn.BucketName, hash, function (err, ret) {
                        var returnData = {};
                        returnData.image = image;
                        if (err) {
                            let situation4 = function* () {
                                returnData.state = 6;
                                returnData.status2 = '数据库中没有此照片，而且ＣＤＮ上删除也失败，具体原因请查看控制台。';
                                returnData.err = err;
                                returnData.ret = ret;
                                console.log(returnData);
                                console.log(err);
                                console.log(ret);
                                yield res.json(returnData);
                            };
                            situation4().next();
                            // http://developer.qiniu.com/docs/v6/api/reference/codes.html
                        } else {
                            // ok
                            let situation5 = function* () {
                                returnData.state = 7;
                                returnData.status2 = '数据库中没有此照片，但ＣＤＮ上有，而且成功删除此照片。';
                                yield res.json(returnData);
                            };
                            situation5().next();
                        }
                    });
                }
            });
    } else {
        req.flash('warning', '请先登录~');
        res.redirect('/users/login');
    }
});

//按相册名称找相册
router.get('/:galleryName', function (req, res, next) {
    var galleryName = req.params.galleryName;
    Galleries.findOne({title: galleryName})
        .exec(function (err, gallery) {
            if (err) {
                return next(err);
            }
            if (gallery) {
                res.render('gallery/gallery.html', {
                    gallery: gallery
                });
            } else {
                req.flash('warning', '找不到该相册');
            }
        });
});

module.exports = router;
