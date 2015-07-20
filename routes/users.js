'use strict';
var express = require('express');
var router = express.Router();
var Users = require('../model/users');
var bcrypt = require('bcrypt-nodejs');
var validator = require('validator-js');
var csrf = require('csurf');

//csrf protection
var csrfProtection = csrf({ cookie: true });
var parseForm = bodyParser.urlencoded({ extended: false });

/* user profile */
router.get('/', function(req, res) {
    var sess = req.session;
    if(sess.user){
        res.render('users/user');
    }else{
        req.flash('warning', '请先登陆');
        res.redirect('/users/login');
    }
});

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
    if(errors){
        errors.forEach(function(error){
            req.flash('warning', error.msg);
        });
        res.redirect('/users/register');
    }else{
        var newUser = new Users({
            mobile: userMobile,
            password: userPassword
        });
        var query = Users.where({ mobile: newUser.mobile });
        query.findOne(function (err, findUsers) {
            if (err) {next(err); }
            if (findUsers) {
                req.flash('warning', '手机号码已被注册');
                res.redirect('/users/register');
            }else{
                newUser.save(function (saveUserErr, savedUser) {
                    if(saveUserErr) {next(saveUserErr); }
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

/* email register */
router.get('/email-register', function (req, res, next) {
    var frontValue = {
        title: '使用邮箱注册'
    };
    res.render('users/email_register', frontValue);
});

router.post('/email-register', function (req, res, next) {
    if(req.checkBody('email').isEmail()){
        res.json({
            state: 2,
            msg: '我们会向这个邮箱发送验证邮件'
        });
    }else{
        res.flash('邮箱地址不正确');
        res.redirect('/email-register');
    }
});

/* register successful */
router.get('/register/success', function (req, res) {
    var frontValue = {
        title: '注册成功'
    };
    res.render('users/register_success', frontValue);
});

/* login */
router.get('/login', csrfProtection, function(req, res){
    if(req.session.user){
        req.flash('info', '你已经登录，无需再次登录。');
        res.redirect('back');
    }else{
        res.render('users/login', {
            title: '登录',
            csrfToken: req.csrfToken()
        });
    }
});

router.post('/login', parseForm, csrfProtection, function (req, res, next) {
    var mobile = req.body.mobile;
    var password = req.body.password;
    req.checkBody('mobile', '手机号玛未填写').notEmpty();
    req.checkBody('mobile', '手机号码格式不正确').isMobilePhone('zh-CN');
    req.checkBody('password', '密码未填写').notEmpty();
    var errors = req.validationErrors();
    if(errors){
        errors.forEach(function(error){
            req.flash('warning', error.msg);
        });
        res.redirect('/users/login');
    }else{
        var query = Users.where({ mobile: mobile });
        query.findOne(function (err, foundUsers) {
            if (err) {next(err); }
            if (foundUsers) {
                //req.session.nodedump = nodedump(Users,{collapse : true});
                var salt = foundUsers.salt;
                var hashPassword = bcrypt.hashSync(password, salt);
                if(hashPassword === foundUsers.hashed_password){
                    req.session.user = {
                        _id: foundUsers._id,
                        mobile: foundUsers.mobile,
                        name: foundUsers.name,
                        type: foundUsers.type
                    };
                    req.flash('success', '登录成功~');
                    var backTo = req.session.backTo;
                    if(backTo){
                        req.session.backTo = null;
                        res.redirect(backTo);
                    }else{
                        res.redirect('/users');
                    }

                }else{
                    req.flash('warning', '密码错误');
                    res.redirect('/users/login');
                }
            }else{
                req.flash('warning', '没有该用户');
                res.redirect('/users/login');
            }
        });
    }
});
/* logout */
router.get('/logout', function (req, res) {
    var sess = req.session;
    if(sess.user){
        sess.user = null;
    }
    res.redirect('/');
});

module.exports = router;
