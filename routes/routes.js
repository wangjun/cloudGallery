var express = require('express');
var router = express.Router();

//get route object
var users = require('./users');
var articles = require('./articles');
var utility = require('./utility');
var admin = require('./admin/admin');
var cdn = require('./cdn/cdn');
var gallery = require('./gallery/gallery');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: '你的相片我来保管' });
});

router.use('/users', users);
router.use('/articles', articles);
router.use('/utility', utility);
router.use('/cdn', cdn);
router.use('/gallery', gallery);
router.use('/admin', function (req, res, next) {
    if(req.session.user.type == 'admin'){
        next();
    }else{
        req.flash('danger', '请勿尝试访问该路径！');
        res.redirect('/');
    }
}, admin);

module.exports = router;
