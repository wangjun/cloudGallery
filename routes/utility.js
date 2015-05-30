'use strict';
var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var csrf = require('csurf');
var captcha = require('ascii-captcha');

var https = require('https');
var querystring = require('querystring');

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
        })
    }else{

        res.json({
            isHuman:false
        })
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
            var waiteTime = (Date.now()-session.sentTime)/1000;
            if(waiteTime>60){
                return {
                    status:true,
                    reason:'enough waiting time'
                };
            }else{
                return {
                    status:false,
                    reason:(60-waiteTime)
                };
            }
        }else{
            return {
                status:true,
                reason:'send sms first time'
            };
        }
    }else{
        return {
            status:false,
            reason:'请使用正常途径使用本网站'
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
        var message = '你的验证码是:'+code+'，请勿向任何人泄露。【LazyCoffee】';
        var postData = {
            mobile:mobile,
            message:message
        };
        var content = querystring.stringify(postData);
        var options = {
            host:'sms-api.luosimao.com',
            path:'/v1/send.json',
            method:'POST',
            auth:'api:key-c1a6bdb2094128098021620783e41c8f',
            agent:false,
            rejectUnauthorized : false,
            headers:{
                'Content-Type' : 'application/x-www-form-urlencoded',
                'Content-Length' :content.length
            }
        };
        var request = https.request(options,function(res){
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                console.log(JSON.parse(chunk));
            });
            res.on('end',function(){
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
        })
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