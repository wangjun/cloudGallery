'use strict';
var express = require('express');
var router = express.Router();
var Users = require('../../model/users');
var csrf = require('csurf');
var bodyParser = require('body-parser');
//csrf protection
var csrfProtection = csrf({ cookie: true });
var parseForm = bodyParser.urlencoded({ extended: false });

//user manager index
router.get('/', function (req, res, next) {
    Users.find({}, function (err, users) {
        if(err){next(err)}
        res.render('admin/users/users.html', {
            users:users
        });
    });
});

//get user edit form
router.get('/edit/:mobile', csrfProtection, function (req, res) {
    var mobile = req.params.mobile;
    Users.findOne({mobile:mobile}, function (err, user) {
        if(err){next(err)}
        res.render('admin/users/edit',{
            user:user,
            mobile : mobile,
            csrfToken:req.csrfToken()
        });
    });
});

//change user property
router.post('/edit/:mobile', parseForm, csrfProtection, function (req, res, next) {
    var mobile = req.body.mobile;
    var name  = req.body.name;
    var type = req.body.type;
    if(req.session.user.type == 'admin'){
        if(req.session.user.mobile == mobile && req.params.mobile == mobile){
            if(type == 'RegisteredUser' || type == 'admin'){
                Users.findOne({mobile:mobile}, function (err, user) {
                    if(err){next(err);}
                    user.name = name;
                    user.type = type;
                    user.save(function (err, updateUser) {
                        if(err){next(err);}
                        req.session.user = updateUser;
                        req.flash('success', updateUser.mobile+' 用户资料更新成功！');
                        res.redirect('/admin/users/edit/'+updateUser.mobile);
                    });
                });
            }
        }else{
            req.flash('danger', '不能直接编辑用户手机号码！');
            res.redirect('/');
        }
    }else{
        req.flash('danger', '你没有权限对该用户资料进行修改。');
        res.redirect('/');
    }
});
module.exports = router;