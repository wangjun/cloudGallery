'use strict';
var express = require('express');
var router = express.Router();
//get router objects
var email = require('./email');
var phone = require('./phone');
var society = require('./society');
/* user profile */
router.get('/', function (req, res) {
    var sess = req.session;
    if (sess.user) {
        res.render('users/user');
    } else {
        req.flash('warning', '请先登陆');
        res.redirect('/users/login');
    }
});
//email logic
router.use('/email', email);
//phone logic
router.use('/phone', phone);
//society logic
router.use('/society', society);
/* login page */
router.get('/login', function (req, res) {
    var frontValue = {
        title: '选择一种登录方式'
    };
    res.render('users/login', frontValue);
});
/* get register page */
router.get('/register', function (req, res) {
    var frontValue = {
        title: '选择一种注册方式'
    };
    res.render('users/register', frontValue);
});
/* logout */
router.get('/logout', function (req, res) {
    var sess = req.session;
    req.flash('success', '你已成功退出登录');
    if (sess.user) {
        sess.user = null;
    }
    res.redirect('/');
});
module.exports = router;
