'use strict';
var express = require('express');
var router = express.Router();
var Users = require('../../model/users');
var bcrypt = require('bcrypt-nodejs');
var csrf = require('csurf');
var bodyParser = require('body-parser');

//get router objects
var emailRegister = require('./email-register');

//csrf protection
var csrfProtection = csrf({cookie: true});
var parseForm = bodyParser.urlencoded({extended: false});

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

//email register
router.use('/email-register', emailRegister);

/* register */
router.get('/register', csrfProtection, function (req, res) {
    //req.session.nodedump = nodedump(captcha,{collapse : true});
    var frontValue = {
        csrfToken: req.csrfToken(),
        title: '注册'
    };
    res.render('users/register', frontValue);
});

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
        res.redirect('/users/register');
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


/* register successful page */
router.get('/register/success', function (req, res) {
    var frontValue = {
        title: '注册成功'
    };
    res.render('users/register_success', frontValue);
});

/* login page */
router.get('/login', csrfProtection, function (req, res) {
    if (req.session.user) {
        req.flash('info', '你已经登录，无需再次登录。');
        res.redirect('back');
    } else {
        res.render('users/login', {
            title: '登录',
            csrfToken: req.csrfToken()
        });
    }
});

/* process login logic */
router.post('/login', parseForm, csrfProtection, function (req, res, next) {
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
        res.redirect('/users/login');
    } else {
        var query = Users.where({mobile: mobile});
        query.findOne(function (err, foundUser) {
            if (err) {
                next(err);
            }
            if (foundUser) {
                //req.session.nodedump = nodedump(Users,{collapse : true});
                var salt = foundUser.salt;
                var hashPassword = bcrypt.hashSync(password, salt);
                if (hashPassword === foundUser.hashedPassword) {
                    req.session.user = {
                        _id: foundUser._id,
                        mobile: foundUser.mobile,
                        name: foundUser.name,
                        type: foundUser.type
                    };
                    req.flash('success', '登录成功！');
                    var backTo = req.session.backTo;
                    if (backTo) {
                        req.session.backTo = null;
                        res.redirect(backTo);
                    } else {
                        res.redirect('/users');
                    }

                } else {
                    req.flash('warning', '密码错误');
                    res.redirect('/users/login');
                }
            } else {
                req.flash('warning', '没有该用户');
                res.redirect('/users/login');
            }
        });
    }
});

/* logout */
router.get('/logout', function (req, res) {
    var sess = req.session;
    if (sess.user) {
        sess.user = null;
    }
    res.redirect('/');
});

module.exports = router;
