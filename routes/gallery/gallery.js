'use strict';
var express = require('express');
var router = express.Router();
var upload = require('./upload');
var bodyParser = require('body-parser');
var Users = require('../../model/users');
var Galleries = require('../../model/galleries');
var libGallery = require('../../lib/gallery/gallery');
var libImage = require('../../lib/gallery/image');
var Images = require('../../model/images');
var csrf = require('csurf');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var config = require('../../lib/admin/config');
var log = require('../../lib/admin/log');
var libCheckUser = require('../../lib/user/check');
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

router.post('/add', libGallery.verifyGalleryReq, libCheckUser.isLogin, parseForm, csrfProtection, function (req, res, next) {
    var title = req.body.title;
    var story = req.body.story;
    var user = req.session.user;
    var userObjectId = new ObjectId(user._id);
    var newGallery = new Galleries({
        title: title,
        story: story,
        owner: userObjectId
    });
    newGallery.save(function (saveGalleryErr, savedGallery) {
        if (saveGalleryErr) {
            return next(saveGalleryErr);
        }
        Users.findOneAndUpdate({_id: userObjectId}, {$push: {galleries: savedGallery._id}}, {'new': true},
            function (findUserErr) {
                if (findUserErr) {
                    return next(findUserErr);
                }
                req.flash('success', '成功创建新相册~');
                var newGalleryUrl = '/gallery/' + savedGallery._id.toHexString();
                res.redirect(newGalleryUrl);
            });
    });
});
//remove gallery
router.post('/remove', libCheckUser.isLogin, function (req, res, next) {
    var galleryId = req.body.galleryId;
    Galleries.findOne({_id: galleryId})
        .populate('owner')
        .populate('images')
        .exec(function (findErr, foundGallery) {
            if (findErr) {
                return next(findErr);
            }
            if (foundGallery) {
                console.log(foundGallery);
                if (foundGallery.owner._id.toHexString() === req.session.user._id) {
                    if (foundGallery.images.length === 0) {
                        libGallery.removeOne(galleryId, function (removeRes) {
                            if (removeRes.state === 1) {
                                res.json({
                                    state: 3,
                                    msg: 'Remove gallery success!'
                                });
                            } else {
                                res.json({
                                    state: 4,
                                    msg: 'We found the gallery and we gonna to remove it. But failed.' +
                                    'probably because the database error.'
                                });
                            }
                        });
                    } else {
                        res.json({
                            state: 5,
                            msg: 'We can not delete a gallery has image. Please remove the images first.'
                        });
                    }

                } else {
                    res.json({
                        state: 2,
                        msg: 'This is not your gallery, remove failed.'
                    });
                }
            } else {
                res.json({
                    state: 1,
                    msg: 'Sorry, we can not find the gallery, no gallery removed.'
                });
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
            .populate('images')
            .exec(function (findGalleryErr, foundGallery) {
                if (findGalleryErr) {
                    return next(findGalleryErr);
                }
                if (foundGallery == null) {
                    res.json({
                        state: 1,
                        status: '没有找到该相册'
                    });
                } else if (foundGallery.owner._id.toHexString() === user._id) {
                    //gallery update function
                    var updateGallery = function (image, status) {
                        var getImageIdIndex = function (imageId) {
                            var imageIds = [];
                            foundGallery.images.forEach(function (eachImage) {
                                imageIds.push(eachImage._id);
                            });
                            return imageIds.indexOf(imageId);
                        };
                        if (getImageIdIndex(image._id) === -1) {
                            Galleries.findOneAndUpdate(
                                {_id: galleryObjectId},
                                {$addToSet: {images: image._id}},
                                {'new': true},
                                function (updateGalleryErr, updatedGallery) {
                                    if (updateGalleryErr) {
                                        return next(updateGalleryErr);
                                    }
                                    if (status === 1) {
                                        res.json({
                                            state: 3,
                                            status: '该图片已存在，不必再上传，但保存了图片与相册之间的关系。',
                                            image: image,
                                            gallery: updatedGallery
                                        });
                                    } else if (status === 2) {
                                        res.json({
                                            state: 4,
                                            status: '图片上传成功，并保存与相册之间的关系。',
                                            image: image,
                                            gallery: updatedGallery
                                        });
                                    }

                                }
                            );
                        } else {
                            res.json({
                                state: 5,
                                status: '该图片已存在，不必再上传，而且当前相册也有此图片，不必更新。',
                                image: image,
                                gallery: foundGallery
                            });
                        }
                    };
                    //update image
                    //found an image
                    Images.findOneAndUpdate(
                        {hash: hash},
                        {$addToSet: {belongGalleries: foundGallery._id, owners: userObjectId}},
                        {'new': true},
                        function (updateImageErr, updatedImage) {
                            if (updateImageErr) {
                                return next(updateImageErr);
                            }
                            if (updatedImage) {
                                updateGallery(updatedImage, 1);
                            } else {
                                //found no image, create a new one.
                                var newImage = new Images({
                                    hash: hash,
                                    key: key,
                                    fileName: fileName,
                                    belongGalleries: galleryObjectId,
                                    owners: userObjectId
                                });
                                newImage.save(function (saveImageErr, savedImage) {
                                    if (saveImageErr) {
                                        return next(saveImageErr);
                                    }
                                    updateGallery(savedImage, 2);
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
        req.json({
            state: 5,
            status: 'Have not login.'
        });
    }

});

//编辑相册
router.get('/edit/:galleryId', csrfProtection, function (req, res, next) {
    var galleryId = req.params.galleryId;
    var user = req.session.user;
    if (user) {
        Galleries.findById(galleryId)
            .populate('owner')
            .exec(function (findGalleryErr, foundGallery) {
                if(findGalleryErr){next(findGalleryErr); }
                if(foundGallery){
                    if(foundGallery.owner._id.toHexString() === user._id){
                        res.render('gallery/edit.html', {
                            gallery: foundGallery,
                            csrfToken: req.csrfToken()
                        });
                    }else{
                        req.flash('warning', '这不是你的相册，无法编辑。');
                        res.redirect('/my-gallery');
                    }
                }
            });
    } else {
        req.flash('warning', '请先登录');
        req.session.backTo = '/gallery/add';
        res.redirect('/users/login');
    }
});
router.post('/edit/:galleryId',
    libGallery.verifyGalleryReq,
    libCheckUser.isLogin,
    parseForm,
    csrfProtection, function (req, res, next) {
        var user = req.session.user;
        var galleryId = req.params.galleryId;
        var title = req.body.title;
        var story = req.body.story;
        Galleries.findById(galleryId)
            .populate('owner')
            .exec(function (findGalleryErr, foundGallery) {
                if(findGalleryErr){next(findGalleryErr); }
                if(foundGallery.owner._id.toHexString() === user._id){

                    Galleries.findOneAndUpdate({_id: new ObjectId(galleryId)}, {
                            $set: {
                                title: title,
                                story: story
                            }
                        }, function (updateGalleryErr, updatedGallery) {
                            if(updateGalleryErr){return next(updateGalleryErr); }
                            if(updatedGallery){
                                req.flash('success', '相册更新成功');
                                res.redirect('/gallery/' + galleryId);
                            }else{
                                req.flash('info', '相册更新失败，无法保存相册。');
                                res.redirect('/gallery/' + galleryId);
                            }
                        }
                    );
                }
            }
        );
    });
//删除照片
router.post('/remove-image', function (req, res, next) {
    var user = req.session.user;
    qiniu.conf.ACCESS_KEY = config.cdn.qiniu.AccessKey;
    qiniu.conf.SECRET_KEY = config.cdn.qiniu.SecretKey;
    if (user) {
        var hash = req.body.hash;
        var galleryId = req.body.galleryId;
        Images.findOne({hash: hash})
            .populate('belongGalleries')
            .populate('owners')
            .exec(function (findImageErr, image) {
                if (findImageErr) {
                    return next(findImageErr);
                }
                var ownerIds = [];
                image.owners.forEach(function (eachOwner) {
                    ownerIds.push(eachOwner._id.toHexString());
                });
                if (ownerIds.indexOf(user._id) === -1) {
                    req.json({
                        state: 8,
                        msg: 'You are not the image owner.'
                    });
                } else {
                    var client = new qiniu.rs.Client();
                    if (image) {
                        if (image.belongGalleries.length > 1) {
                            Galleries.findOneAndUpdate(
                                {_id: new ObjectId(galleryId)},
                                {$pull: {images: {_id: image._id}}},
                                function (updateGalleryErr, updatedGallery) {
                                    if (updateGalleryErr) {
                                        return next(updateGalleryErr);
                                    }
                                    Images.findOneAndUpdate(
                                        {_id: image._id},
                                        {
                                            $pull: {
                                                belongGalleries: {_id: updatedGallery._id},
                                                owners: {_id: new ObjectId(user._id)}
                                            }
                                        },
                                        function (updateImageErr, updatedImage) {
                                            if (updateImageErr) {
                                                return next(updateImageErr);
                                            }
                                            if (updatedImage) {
                                                res.json({
                                                    image: image,
                                                    gallery: updatedGallery,
                                                    state: 1,
                                                    msg: 'Image have not removed in CDN and database but removed imageId in this gallery and image belong gallery.'
                                                });
                                            } else {
                                                res.json({
                                                    image: image,
                                                    gallery: updatedGallery,
                                                    state: 5,
                                                    msg: 'Image have not removed in CDN and database but removed imageId in this gallery but not image belong gallery.'
                                                });
                                            }
                                        });
                                }
                            );
                        } else {
                            client.remove(config.cdn.qiniu.BucketName, image.key, function (err, ret) {
                                if (err) {
                                    if (err.code === 612) {
                                        libImage.removeOneFromDatabase(image._id, galleryId, user._id,
                                            function (removeImageErr, removedImage, updatedGallery) {
                                                if (removeImageErr) {
                                                    res.json(removeImageErr);
                                                }
                                                res.json({
                                                    state: 2,
                                                    status: 'ＣＤＮ上删除失败，数据库中删除，具体原因请查看控制台。',
                                                    image: removedImage,
                                                    gallery: updatedGallery,
                                                    err: err,
                                                    ret: ret
                                                });
                                            });
                                    }
                                    // http://developer.qiniu.com/docs/v6/api/reference/codes.html
                                } else {
                                    // ok
                                    Images.findOneAndRemove({_id: image._id}, function (removeImageErr, removedImage) {
                                        if (removeImageErr) {
                                            return next(removeImageErr);
                                        }
                                        if (removedImage) {
                                            res.json({
                                                    image: image,
                                                    state: 4,
                                                    status: 'Delete image both in CDN and database entirely.'
                                                }
                                            );
                                        }
                                    });

                                }
                            });
                        }
                    } else {
                        //数据库没有此照片
                        client.remove(config.cdn.qiniu.BucketName, hash, function (err, ret) {
                            if (err) {
                                res.json({
                                    state: 6,
                                    status2: '数据库中没有此照片，而且ＣＤＮ上删除也失败，具体原因请查看控制台。',
                                    err: err,
                                    image: image,
                                    ret: ret
                                });
                            } else {
                                res.json({
                                    state: 7,
                                    status2: '数据库中没有此照片，但ＣＤＮ上有，而且成功删除此照片。'
                                });
                            }
                        });
                    }
                }
            });
    } else {
        req.json({
            state: 3,
            msg: '未登录，无法删除'
        });
    }
});

//按相册ID查找相册
router.get('/:galleryId', function (req, res, next) {
    var galleryId = req.params.galleryId;
    var galleryObjectId = new ObjectId(galleryId);
    Galleries.findOne({_id: galleryObjectId})
        .populate('images')
        .populate('owner')
        .exec(function (err, foundGallery) {
            if (err) {
                return next(err);
            }
            if (foundGallery) {
                foundGallery.images.forEach(function (eachImage) {
                    Images.findOne({_id: eachImage._id}, function (findImageErr, foundImage) {
                        if (!foundImage) {
                            Galleries.findOneAndUpdate({_id: galleryObjectId},
                                {$pull: {images: {_id: eachImage._id}}},
                                function (updateGalleryErr, updatedGallery) {
                                    if (updateGalleryErr) {
                                        return next(updateGalleryErr);
                                    }
                                    if (updatedGallery) {
                                        log.add('warning',
                                            'Can not find this image: ' + eachImage._id + ' in ' + updatedGallery._id.toHexString() + '. So I am going to remove that gallery in database.',
                                            'remove a unrelated image in a gallery.');
                                    }
                                }
                            );
                        }
                    });
                });
                res.render('gallery/gallery.html', {
                    gallery: foundGallery,
                    title: foundGallery.title
                });
            } else {
                req.flash('warning', '找不到该相册');
                res.redirect('back');
            }
        });
});

//按相册名称找相册
router.get('/:galleryName', function (req, res, next) {
    var galleryName = req.params.galleryName;
    Galleries.findOne({title: galleryName})
        .exec(function (err, foundGallery) {
            if (err) {
                return next(err);
            }
            if (foundGallery) {
                res.render('gallery/gallery.html', {
                    gallery: foundGallery
                });
            } else {
                req.flash('warning', '找不到该相册');
            }
        });
});

module.exports = router;
