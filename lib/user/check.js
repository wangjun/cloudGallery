'use strict';
var checkUser = {};

//check is login
checkUser.isLogin = function (req, res, next) {
    var user = req.session.user;
    if(user === undefined){
        req.flash('info', '请先登陆~');
        res.redirect('/users/login');
    }else{
        next();
    }
};

//check is admin
checkUser.isAdmin = function (req, res, next) {
    var user = req.session.user;
    if(user.type === 'admin'){
        next();
    }else{
        req.flash('danger', '请勿尝试访问该路径！');
        res.redirect('/');
    }
};

module.exports = checkUser;
