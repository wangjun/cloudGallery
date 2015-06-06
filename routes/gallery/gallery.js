var express = require('express');
var router = express.Router();
var upload = require('./upload');
var bodyParser = require('body-parser');
var gallery = require('../../model/gallery');
var csrf = require('csurf');

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

router.post('/add', parseForm, csrfProtection, function (req, res) {
    var title = req.body.title;
    var story = req.body.story;
    var user = req.session.user;
    req.checkBody('title','相册必须有名称。').notEmpty();
    req.checkBody('title', '相册名称不能多于18个字，也不能少于2个字。').isLength(2, 18);
    var errors = req.validationErrors();
    if(user){
        if(errors){
            errors.forEach(function(error){
                req.flash('warning', error.msg);
            });
            res.redirect('/gallery/add');
        }else{
            newGallery = new gallery({
                title : title,
                story : story,
                owner : user._id
            });
        }
    }else{
        req.session.backTo = '/gallery/add';
        req.flash('warning', '请先登录');
        res.redirect('/users/login');
    }

});

module.exports = router;