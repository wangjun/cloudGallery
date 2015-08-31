'use strict';
var express = require('express');
var router = express.Router();
var transporter = require('../../lib/admin/email');
var randomstring = require('randomstring');
var Users = require('../../model/users');
var validator = require('validator');

/* email register */
router.get('/register', function (req, res) {
    var frontValue = {
        title: '使用邮箱注册 - 第一步',
        step: 'step1'
    };
    res.render('users/email/register', frontValue);
});

router.post('/register', function (req, res, next) {
    var email = req.body.email;
    if (validator.isEmail(email)) {
        Users.findOne({email: email})
            .exec(function (findErr, foundUser) {
                if (findErr) {
                    return next(findErr);
                }
                if (foundUser) {
                    req.flash('warning', '该邮箱地址已被注册');
                    res.json({
                        state: 3,
                        msg: '此邮件地址已被注册'
                    });
                } else {
                    var buf = randomstring.generate(5);
                    req.session.emailCode = buf;
                    req.session.registerEmail = email;
                    req.session.isEmailVerified = false;
                    var mailOptions = {
                        from: 'system@lazycoffee.com',
                        to: email,
                        subject: '来自Lazycoffee的验证邮件',
                        html: '<h1>请点击下方链接继续注册</h1>' +
                        '<p>' +
                        '<a href="http://www.lazycoffee.com/users/email/register/password/' + buf + '">' +
                        'http://www.lazycoffee.com/users/email/register/step2/' + buf + '' +
                        '</a>' +
                        '</p>'
                    };
                    transporter.sendMail(mailOptions, function (error, info) {
                        if (error) {
                            return console.log(error);
                        }
                        console.log(info);
                        res.json({
                            state: 2,
                            msg: '我们会向这个邮箱发送验证邮件'
                        });
                    });
                }
            });
    } else {
        res.json({
            state: 2,
            msg: '邮件地址格式不正确'
        });
    }
});

/* email sent page */
router.get('/sent', function (req, res) {
    var fontValues = {
        title: '验证邮件发送成功！',
        step: 'step2'
    };
    res.render('users/email/sent', fontValues);
});


/* email register next step page(after email verification)  */
router.get('/register/password/:code', function (req, res) {
    var code = req.params.code;

    function resToStep2() {
        let frontValue = {
            title: '邮箱注册 - 填写密码',
            step: 'step3'
        };
        res.render('users/email/register-password', frontValue);
    }
    if (req.session.isEmailVerified) {
        resToStep2();
    } else if (code === req.session.emailCode && req.session.registerEmail) {
        req.session.isEmailVerified = true;
        resToStep2();
    } else {
        req.flash('info', '验证码不正确，是否链接过期了？是否在当前浏览器申请验证邮件？');
        res.redirect('/users/email/register/password/code');
    }
});

/* email register next step request process */
router.post('/register/password', function (req, res, next) {
    if (req.session.isEmailVerified) {
        var password = req.body.password;
        var email = req.session.registerEmail;
        req.checkBody('password', '密码不能为空').notEmpty();
        req.checkBody('password', '密码长度在6-20个字符之间').isLength(8, 20);
        req.checkBody('rePassword', '确认密码不能为空').notEmpty();
        req.checkBody('rePassword', '确认密码必须与密码一致').equals(password);
        var errors = req.validationErrors();
        if (errors) {
            errors.forEach(function (error) {
                req.flash('info', error.msg);
            });
            res.redirect('/users/email/register/password/code');
        } else {
            Users.findOne({email: email})
                .exec(function (findErr, foundUser) {
                    if (findErr) {
                        return next(findErr);
                    }
                    if (foundUser) {
                        req.json({
                            state: 4,
                            msg: '此邮件已被注册，你是怎么修改邮件地址的？'
                        });
                    } else {
                        var newUser = new Users({
                            email: email,
                            password: password
                        });
                        newUser.save(function (saveErr, savedUser) {
                            if (saveErr) {
                                return next(saveErr);
                            }
                            if (savedUser) {
                                req.flash('success', '恭喜注册成功，你现在可以使用该邮箱地址登陆LazyCoffee');
                                req.session.user = {
                                    _id: savedUser._id,
                                    name: savedUser.name,
                                    type: savedUser.type
                                };
                                res.json({
                                    state: 1,
                                    msg: '用户注册成功！'
                                });
                            } else {
                                res.json({
                                    state: 2,
                                    msg: '数据库保存用户失败'
                                });
                            }
                        });
                    }
                });
        }
    } else {
        res.json({
            state: 3,
            msg: '尚未通过邮件验证'
        });
    }
});
/* register success */
router.get('/register/success', function (req, res) {
    res.render('users/email/success');
});
/* email login page */
router.get('/login', function (req, res) {
    var frontValues = {
        title: '使用邮箱地址登录LazyCoffee'
    };
    res.render('users/email/login', frontValues);
});


/* email login controller */
router.post('/login', function (req, res, next) {
    var email = req.body.email;
    var password = req.body.password;
    var isEmail = validator.isEmail(email);
    if(isEmail){
        Users.findOne({email: email})
            .exec(function (findErr, foundUser) {
                if(findErr){return next(findErr); }
                if(foundUser){
                    foundUser.checkPassword(password, function (isPasswordCorrect) {
                        if(isPasswordCorrect){
                            req.flash('success', '登录成功！');
                            req.session.user = {
                                _id: foundUser._id,
                                name: foundUser.name,
                                email: foundUser.email,
                                type: foundUser.type
                            };
                            res.redirect('/my-gallery');
                        }else{
                            req.flash('warning', '密码错误');
                            res.redirect('/users/email/login');
                        }
                    });
                }else{
                    req.flash('info', '没有找到该用户，邮箱地址写对了吗？');
                    res.redirect('/users/email/login');
                }
            });
    }else{
        req.flash('info', '邮箱地址格式有误');
        res.redirect('/users/email/login');
    }
});

module.exports = router;
