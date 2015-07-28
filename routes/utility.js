'use strict';
var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var csrf = require('csurf');
var captcha = require('ascii-captcha');
var https = require('https');
var querystring = require('querystring');
var moment = require('moment');
var crypto = require('crypto');
var utility = require('../lib/handy/utility');
//config variables
var smsAccountSid = 'aaf98f894d328b13014d40c204a7092c';
var smsToken = '030abd6906ec426bb7404f631bc8984d';
var smsChildAccount = 'aaf98f894d328b13014d40c239fb0930';
var smsSendBaseUrl = 'sandboxapp.cloopen.com';
var smsSendUrlPort = 8883;
var smsAppId = 'aaf98f894d328b13014d40c239df092f';
var smsAppToken = 'dbd650290dae11e5ac73ac853d9f54f2';
var smsTemplateId = '1';
//csrf protection
var csrfProtection = csrf({ cookie: true });
var parseForm = bodyParser.urlencoded({ extended: false });

//captcha
router.get('/i-am-not-a-robot', csrfProtection, function(req, res) {
    var isHuman = req.session.isHuman || false;
    if(isHuman==true){
        res.json({
            isHuman:true
        });
    }else{
        var captchaText = captcha.generateRandomText(4);
        req.session.captchaText = captchaText;
        var pre = '<pre style="font-size:3px;line-height:2px;">' + captcha.word2Transformedstr(captchaText) + '</pre>';
        res.json({
            isHuman:false,
            captchaHtml : pre,
            csrfToken : req.csrfToken()
        });
    }
});

router.post('/check-captcha', parseForm, csrfProtection, function (req, res) {
    var captchaText = req.body.captchaText;
    if(captchaText.toLowerCase()===req.session.captchaText.toLowerCase()){
        req.session.isHuman = true;
        delete req.session.captchaText;
        res.json({
            isHuman:true
        });
    }else{
        res.json({
            isHuman:false
        });
    }
});

//check is human
router.get('/check-is-human', function (req, res) {
    if(req.session.isHuman){
        res.json({
            isHuman:true
        });
    }else{
        res.json({
            isHuman:false
        });
    }
});

//clean session
router.get('/clean-session-is-human', function (req, res) {
    if(delete req.session.isHuman){
        req.flash('success', '已清除isHuman数据');
        res.redirect('/');
    }else{
        req.flash('error', '清除isHuman数据失败');
        res.redirect('/');
    }
});

//check is allowed to send sms
function isAllowedToSendSms(session){
    if(session.isHuman){
        if(session.sentTime){
            var waiteTime = (Date.now() - session.sentTime)/1000;
            if(waiteTime>60){
                return {
                    status: true,
                    reason: 'enough waiting time'
                };
            }else{
                return {
                    status: false,
                    reason: (60 - waiteTime)
                };
            }
        }else{
            return {
                status: true,
                reason: 'send sms first time'
            };
        }
    }else{
        return {
            status: false,
            reason: '请使用正常途径使用本网站'
        };
    }
}

//check is allowed to send sms
router.get('/is-allowed-to-send-sms', function (req, res) {
    var isAllowedSms = isAllowedToSendSms(req.session);
    res.json(isAllowedSms);
});


//send sms
router.post('/send-sms', function (req, res) {
    //is allowed to send sms ?
    var isAllowedSms = isAllowedToSendSms(req.session);
    //send sms
    if(isAllowedSms.status){
        //set sent time
        req.session.sentTime = Date.now();
        //create sms request
        var mobile = req.body.mobile;
        var code = parseInt(Math.random()*10000);
        req.session.mobileCaptcha = code;
        var message = '你的验证码是:' + code + '，请勿向任何人泄露。【LazyCoffee】';
        var postData = {
            to: mobile,
            appId: smsAppId,
            templateId: smsTemplateId,
            datas: [code, 1]
        };
        var content = JSON.stringify(postData);
        var currentTime = moment().format('YYYYMMDDHHmmss');
        var parameter = smsAccountSid + smsToken + currentTime;
        var sigParameter = utility.md5(parameter).toUpperCase();
        var authParameter = smsAccountSid + ':' + currentTime;
        var authorizationBase64 = new Buffer(authParameter).toString('base64');
        var options = {
            host: smsSendBaseUrl,
            path:'/2013-12-26/Accounts/' + smsAccountSid + '/SMS/TemplateSMS?sig=' + sigParameter,
            port: smsSendUrlPort,
            method:'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json;charset=utf-8',
                'Content-Length': content.length,
                'Authorization': authorizationBase64
            }
        };
        console.log(options);
        var request = https.request(options, function(httpsRes){
            httpsRes.setEncoding('utf8');
            httpsRes.on('data', function (chunk) {
                console.log(chunk.toString());
            });
            httpsRes.on('end',function(){
                console.log('over');
            });
        });
        request.write(content);
        request.end();
        res.json({
            sentSms:true
        });
    }else{
        res.json({
            smsStatus:false,
            reason:isAllowedSms.reason
        });
    }
});

/* index add gallery link */
router.get('/add-gallery', function (req, res) {
    if(req.session.user){
        res.redirect('/gallery/add');
    }else{
        req.flash('info', '注册一个账号即可创建相册，过程非常简单哦！<a href="/users/email/login">已有账号？</a>');
        res.redirect('/users/email/register');
    }
});

//a function test page
router.get('/test', function (req, res) {
    var now = new Date.now();
    res.render('utility/test',
        {
            nodedump:now
        }
    );
});
module.exports = router;
