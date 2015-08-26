'use strict';
var express = require('express');
var router = express.Router();
var https = require('https');
var querystring = require('querystring');
var moment = require('moment');
var Users = require('../../model/users');
var Weibo = require('.././model/sinaWeibo');
var log = require('../../lib/admin/log');
router.get('/weibo/register', function (req, res, next) {
    var reqBuf = req.query.state;
    var buf = req.session.buf;
    var code = req.query.code;
    var isLegal = reqBuf === buf;
    var accessToken = req.session.accessToken;
    if(typeof accessToken === 'string'){
        accessToken = JSON.parse(accessToken);
    }
    //get access token
    var getAccessToken = function (cb) {
        var callback = cb || function(){};
        var postData = querystring.stringify({
            client_id: '2521804735',
            client_secret: 'ab70dca632a59972d7fc6103fda187b9',
            grant_type: 'authorization_code',
            scope: 'email',
            code: code,
            redirect_uri: 'http://www.lazycoffee.com/users/society/weibo/register'
        });
        var reqOption = {
            hostname: 'api.weibo.com',
            port: 443,
            path: '/oauth2/access_token',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': postData.length
            }
        };
        var accessTokenReq = https.request(reqOption, function (accessTokenRes) {
            accessTokenRes.setEncoding('utf8');
            var data = '';
            accessTokenRes.on('data', function (chunk) {
                data += chunk;
            });
            accessTokenRes.on('end', function () {
                req.session.accessToken = JSON.parse(data);
                if(req.session.accessToken.error){
                    req.flash('info', '抱歉，无法获取授权，请重试一次：<br>' + data);
                    res.redirect('/users/register');
                }else{
                    req.session.accessToken.expireDate = moment().add(req.session.accessToken.expires_in, 's').format('YYYY年MM月DD日HH时mm分ss秒');
                    callback(req.session.accessToken);
                }
            });
        });
        accessTokenReq.write(postData);
        accessTokenReq.end();
        accessTokenReq.on('error', function (err) {
            console.log(err);
        });
    };
    var getWeiboInfo = function (cb) {
        var callback = cb || function(){};
        var option = {
            hostname: 'api.weibo.com',
            port: 443,
            path: '/2/users/show.json?uid=' + accessToken.uid + '&access_token=' + accessToken.access_token,
            method: 'GET'
        };
        var weiboInfoReq = https.request(option, function (weiboInfoRes) {
            weiboInfoRes.setEncoding('utf8');
            var data = '';
            weiboInfoRes.on('data', function (chunk) {
                data += chunk;
            });
            weiboInfoRes.on('end', function () {
                try{
                    req.session.weiboInfo = JSON.parse(data);
                }catch(err){
                    console.log(err);
                }
                callback(req.session.weiboInfo);
            });
        });
        weiboInfoReq.end();
        weiboInfoReq.on('error', function (err) {
            console.log(err);
        });
    };
    var saveWeiboInfo = function (weiboInfo, cb) {
        var callback = cb || function(){};
        Weibo.findOne({id: weiboInfo.id}, function (findWeiboErr, foundWeibo) {
            if(findWeiboErr){return next(findWeiboErr); }
            if(foundWeibo){
                Users.findOne({_id: foundWeibo.user}, function(findUserErr, foundUser){
                    if(findUserErr){return next(findUserErr); }
                    if(foundUser){
                        req.session.users = {
                            _id: foundUser._id,
                            name: foundUser.name,
                            type: foundUser.type
                        };
                        callback();
                    }else{
                        log.add('Error', 'We can not find user base on weibo\'s user objectId.', 'Get user info error.');
                        req.flash('info', '抱歉，获取用户信息失败，无法登录');
                        res.redirect('/users/register');
                    }
                });
            }else{
                var newWeibo = new Weibo(function () {
                    var returnObject = {};
                    for(var key in weiboInfo){
                        if(weiboInfo.hasOwnProperty(key)){
                            returnObject[key] = weiboInfo[key];
                        }
                    }
                    returnObject.expires_in = req.session.accessToken.expires_in;
                    returnObject.expireDate = req.session.accessToken.expireDate;
                    returnObject.access_token = req.session.accessToken.access_token;
                    returnObject.uid = req.session.accessToken.uid;
                    return returnObject;
                });
                newWeibo.save(function (saveWeiboErr, savedWeibo) {
                    if(saveWeiboErr){return next(saveWeiboErr); }
                    if(savedWeibo){
                        var newUser = new Users({
                            sinaWeibo: savedWeibo._id,
                            name: weiboInfo.screen_name,
                            type: 'RegisteredUser'
                        });
                        newUser.save(function (saveUserErr, savedUser) {
                            if(saveUserErr){return next(saveUserErr); }
                            if(savedUser){
                                Weibo.findOneAndUpdate({_id: savedUser.sinaWeibo},
                                    {user: savedUser._id},
                                    function (updateWeiboErr, updatedWeibo) {
                                        if(updateWeiboErr){return next(updateWeiboErr); }
                                        if(updatedWeibo){
                                            req.session.users = {
                                                _id: savedUser._id,
                                                name: savedUser.name,
                                                type: savedUser.type
                                            };
                                            callback();
                                        }else{
                                            log.add('Error', 'We can not update weibo info.', 'Update weibo info error.');
                                            req.flash('info', '抱歉，更新用户微博资料失败，无法登录');
                                            res.redirect('/users/register');
                                        }
                                    }
                                );
                            }else{
                                log.add('Error', 'We can not save user info.', 'Save user info error.');
                                req.flash('info', '抱歉，保存用户资料失败，无法登录');
                                res.redirect('/users/register');
                            }
                        });
                    }else{
                        log.add('Error', 'We can not save weibo info.', 'Save weibo info error.');
                        req.flash('info', '抱歉，保存用户微博资料失败，无法登录');
                        res.redirect('/users/register');
                    }
                });
            }
        });
    };
    var routeRes = function (accessTokenPassed) {
        getWeiboInfo(function (weiboInfo) {
            saveWeiboInfo(weiboInfo, function () {
                res.render('users/society/weibo_register', {
                    title: '登录成功',
                    isLegal: isLegal,
                    expireDate: accessTokenPassed.expireDate,
                    uid: accessTokenPassed.uid,
                    access_token: accessTokenPassed.access_token
                });
            });
        });
    };
    if(accessToken === undefined){
        getAccessToken(function (accessTokenArg) {
            routeRes(accessTokenArg);
        });
    }else{
        if(accessToken.error){
            getAccessToken(function (accessTokenArg) {
                routeRes(accessTokenArg);
            });
        }else{
            routeRes(accessToken);
        }
    }
});
router.post('/weibo/register', function (req, res) {
    res.json({content: 'you passed'});
});

module .exports = router;
