'use strict';
var express = require('express');
var router = express.Router();
var https = require('https');
var querystring = require('querystring');
var moment = require('moment');
//router.all('/', function (req, res, next) {
//    res.header("Access-Control-Allow-Origin", "*");
//    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//    next();
//});
router.get('/weibo/register', function (req, res) {
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
            scope:'email',
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
            path: '/2/users/show.json?uid='+accessToken.uid+'&access_token='+accessToken.access_token,
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
    var routeRes = function (accessTokenPassed) {
        getWeiboInfo(function (weiboInfo) {
            console.log(weiboInfo);
            res.render('users/society/weibo_register', {
                title: '补充资料',
                buf: buf,
                isLegal: isLegal,
                expires_in: accessTokenPassed.expires_in,
                expireDate: accessTokenPassed.expireDate,
                uid: accessTokenPassed.uid,
                access_token: accessTokenPassed.access_token,
                weiboInfo: weiboInfo
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