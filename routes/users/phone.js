'use strict';
var express = require('express');
var router = express.Router();
var csrf = require('csurf');
var bodyParser = require('body-parser');
var bcrypt = require('bcrypt-nodejs');
var Users = require('../../model/users');
//csrf protection
var csrfProtection = csrf({cookie: true});
var parseForm = bodyParser.urlencoded({extended: false});
/* get phone login page */
router.get('/login', function (req, res) {
    if (req.session.user) {
        req.flash('info', '你已经登录，无需再次登录。');
        res.redirect('back');
    } else {
        res.render('users/phone/login', {
            title: '登录',
            csrfToken: req.csrfToken()
        });
    }
});
/* phone login processor */
router.post('/login', function (req, res, next) {
    var mobile = req.body.mobile;
    var password = req.body.password;
    req.checkBody('mobile', '手机号玛未填写').notEmpty();
    req.checkBody('mobile', '手机号码格式不正确').isMobilePhone('zh-CN');
    req.checkBody('password', '密码未填写').notEmpty();
    var errors = req.validationErrors();
    if (errors) {
        errors.forEach(function (error) {
            req.flash('warning', error.msg);
        });
        res.redirect('/users/phone/login');
    } else {
        var query = Users.where({mobile: mobile});
        query.findOne(function (err, foundUsers) {
            if (err) {
                next(err);
            }
            if (foundUsers) {
                //req.session.nodedump = nodedump(Users,{collapse : true});
                var salt = foundUsers.salt;
                var hashPassword = bcrypt.hashSync(password, salt);
                if (hashPassword === foundUsers.hashedPassword) {
                    req.session.user = {
                        _id: foundUsers._id,
                        mobile: foundUsers.mobile,
                        name: foundUsers.name,
                        type: foundUsers.type
                    };
                    req.flash('success', '登录成功~');
                    var backTo = req.session.backTo;
                    if (backTo) {
                        req.session.backTo = null;
                        res.redirect(backTo);
                    } else {
                        res.redirect('/my-gallery');
                    }

                } else {
                    req.flash('warning', '密码错误');
                    res.redirect('/users/phone/login');
                }
            } else {
                req.flash('warning', '没有该用户');
                res.redirect('/users/phone/login');
            }
        });
    }
});

/* get phone register page */
router.get('/register', csrfProtection, function (req, res) {
    //req.session.nodedump = nodedump(captcha,{collapse : true});
    var frontValue = {
        csrfToken: req.csrfToken(),
        title: '注册'
    };
    res.render('users/phone/register', frontValue);
});

/* phone register processor */
router.post('/register', parseForm, csrfProtection, function (req, res, next) {
    var userMobile = req.body.mobile;
    var userPassword = req.body.password;
    //var user_rePassword = req.body.rePassword;
    req.checkBody('mobile', '手机未填写').notEmpty();
    req.checkBody('mobileCaptcha', '手机验证码未填写').notEmpty();
    req.checkBody('mobileCaptcha', '手机验证码不一致').equals(req.session.mobileCaptcha);
    req.checkBody('password', '密码未填写').notEmpty();
    req.checkBody('rePassword', '确认密码未填写').notEmpty();
    req.checkBody('mobile', '手机格式不正确').isMobilePhone('zh-CN');
    req.checkBody('password', '密码长度必须在6-16位之间').isLength(6, 16);
    req.checkBody('rePassword', '确认密码与密码不一致').equals(userPassword);
    var errors = req.validationErrors();
    if (errors) {
        errors.forEach(function (error) {
            req.flash('warning', error.msg);
        });
        res.redirect('/users/phone/register');
    } else {
        var newUser = new Users({
            mobile: userMobile,
            password: userPassword
        });
        var query = Users.where({mobile: newUser.mobile});
        query.findOne(function (err, findUsers) {
            if (err) {
                next(err);
            }
            if (findUsers) {
                req.flash('warning', '手机号码已被注册');
                res.redirect('/users/register');
            } else {
                newUser.save(function (saveUserErr, savedUser) {
                    if (saveUserErr) {
                        next(saveUserErr);
                    }
                    req.session.user = {
                        _id: savedUser._id,
                        name: savedUser.name,
                        email: savedUser.email,
                        type: savedUser.type
                    };
                    res.redirect('/users/register/success');
                });
            }
        });
    }
});

/* phone register successful page */
router.get('/register/success', function (req, res) {
    var frontValue = {
        title: '注册成功'
    };
    res.render('users/register_success', frontValue);
});
module.exports = router;
