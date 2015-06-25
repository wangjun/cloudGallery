'use strict';
var express = require('express');
var router = express.Router();
var checkUser = require('../lib/user/check');

//get route object
var users = require('./users');
var articles = require('./articles');
var utility = require('./utility');
var admin = require('./admin/admin');
var cdn = require('./cdn/cdn');
var gallery = require('./gallery/gallery');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index');
});

router.use('/users', users);
router.use('/articles', articles);
router.use('/utility', utility);
router.use('/cdn', cdn);
router.use('/gallery', gallery);
router.use('/admin', checkUser.isLogin, checkUser.isAdmin, admin);

module.exports = router;
