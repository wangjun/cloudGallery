'use strict';
var express = require('express');
var router = express.Router();
var Users = require('../model/users');
var bcrypt = require('bcrypt-nodejs');
var bodyParser = require('body-parser');
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
        req.flash('warning','请先登陆');
        res.redirect('/users/login');
    }
});

/* register */
router.get('/register', csrfProtection, function (req, res) {
    //req.session.nodedump = nodedump(captcha,{collapse : true});
    var frontValue = {
        csrfToken: req.csrfToken(),
        title:'注册'
    };
    res.render('users/register',frontValue);
});

router.post('/register', parseForm, csrfProtection, function (req, res, next) {
    var user_mobile = req.body.mobile;
    var user_password = req.body.password;
    //var user_rePassword = req.body.rePassword;
    req.checkBody('mobile', '手机未填写').notEmpty();
    req.checkBody('mobile_captcha', '手机验证码未填写').notEmpty();
    req.checkBody('mobile_captcha', '手机验证码不一致').equals(req.session.mobileCaptcha);
    req.checkBody('password', '密码未填写').notEmpty();
    req.checkBody('rePassword', '确认密码未填写').notEmpty();
    req.checkBody('mobile', '手机格式不正确').isMobilePhone('zh-CN');
    req.checkBody('password', '密码长度必须在6-16位之间').isLength(6,16);
    req.checkBody('rePassword', '确认密码与密码不一致').equals(user_password);
    var errors = req.validationErrors();
    if(errors){
        errors.forEach(function(error){
            req.flash('warning', error.msg);
        });
        res.redirect('/users/register');
    }else{
        var registerUser = new Users({
            mobile:user_mobile,
            password:user_password
        });
        var query  = Users.where({ mobile: registerUser.mobile });
        query.findOne(function (err, Users) {
            if (err) {next(err);}
            if (Users) {
                req.flash('warning','手机号码已被注册');
                res.redirect('/users/register');
            }else{
                registerUser.save(function (err, register_user) {
                    if(err) {next(err);}
                    req.session.user = {
                        _id:register_user._id,
                        name:register_user.name,
                        email:register_user.email,
                        type:register_user.type
                    };
                    res.redirect('/users/register/success');
                });
            }
        });
    }
});

router.get('/register/success', function (req, res) {
    var frontValue = {
        title:'注册成功'
    };
    res.render('users/register_success',frontValue);
});

/* login */
router.get('/login', csrfProtection, function(req, res){
    if(req.session.user){
        req.flash('info','你已经登录，无需再次登录。');
        res.redirect('back');
    }else{
        res.render('users/login',{
            title:'登录',
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
        var query  = Users.where({ mobile: mobile });
        query.findOne(function (err, Users) {
            if (err) {next(err);}
            if (Users) {
                //req.session.nodedump = nodedump(Users,{collapse : true});
                var salt = Users.salt;
                var hashPassword = bcrypt.hashSync(password, salt);
                if(hashPassword === Users.hashed_password){
                    req.session.user = {
                        _id:Users._id,
                        mobile:Users.mobile,
                        name:Users.name,
                        type:Users.type
                    };
                    req.flash('success','登录成功~');
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
