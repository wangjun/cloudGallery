'use strict';
var request = require('../handy/request');
var utility = require('../handy/utility');
var Weibo = require('../../model/sinaWeibo');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var weibo = {};
weibo.getAccessTokenByUserId = function (userId, cb) {
    var userObjectId = utility.isObject(userId) ? userId : new ObjectId(userId);
    console.log(userObjectId);
    console.log(typeof userObjectId);
    Weibo.findOne({user: userObjectId})
        .populate('user')
        .exec(function (findWeiboErr, foundWeibo) {
            if (findWeiboErr) {
                return findWeiboErr;
            }
            if(foundWeibo){
                cb(foundWeibo.access_token);
            }else{
                cb(null);
            }
        });
};
weibo.getAccessTokenInfoByUserId = function (userId, cb) {
    this.getAccessTokenByUserId(userId, function (accessToken) {
        this.getAccessTokenInfo(accessToken, function (accessTokenInfo) {
            cb(accessTokenInfo);
        });
    });
};
weibo.getAccessTokenInfo = function (accessToken, cb) {
    var postWeiboUrl = 'https://api.weibo.com/2/statuses/update.json';
    var self = this;
    request.post(postWeiboUrl, {
        access_token: accessToken
    }, function (err, accessTokenInfo) {
        if (err) {
            return err;
        }
        if (accessTokenInfo) {
            console.log(accessTokenInfo);
            self.updateAccessTokenInfo(accessTokenInfo);
            cb(accessTokenInfo);
        }
    });
};
weibo.isAccessTokenValid = function (accessToken, cb) {
    this.getAccessTokenInfo(accessToken, function (accessTokenInfo) {
        cb(accessTokenInfo.expires_in > 10);
    });
};
weibo.updateAccessTokenInfo = function (accessTokenInfo, cb) {
    weibo.findOneAndUpdate({uid: accessTokenInfo.uid}, {
        $set: {
            expires_in: accessTokenInfo.expires_in,
            scope: accessTokenInfo.scope,
            create_at: accessTokenInfo.create_at,
            appkey: accessTokenInfo.appkey
        }
    }, function (updateWeiboErr, updatedWeibo) {
        if (updateWeiboErr) {
            return updateWeiboErr;
        }
        if (cb) {
            cb(updatedWeibo);
        } else {
            return updatedWeibo;
        }

    });
};
weibo.postAWeiboByAccessToken = function (accessToken, content, cb) {
    var self = this;
    self.isAccessTokenValid(accessToken, function (isAccessTokenValid) {
        if (isAccessTokenValid) {
            var postWeiboUrl = 'https://api.weibo.com/2/statuses/update.json';
            request.post(postWeiboUrl, {
                access_token: accessToken,
                status: encodeURIComponent(content)
            }, function (resWeibo) {
                cb(null, resWeibo);
            });
        } else {
            cb({
                state: 4,
                msg: 'AccessToken is not valid.'
            });
        }
    });

};
weibo.postAWeiboByUserId = function (userId, content, cb) {
    var self = this;
    self.getAccessTokenByUserId(userId, function (accessToken) {
        if(accessToken){
            self.postAWeiboByAccessToken(accessToken, content, cb);
        }else{
            cb({
                state: 1,
                msg: 'Can not find access token. May be this user have not verified weibo account.'
            });
        }
    });
};
module.exports = weibo;
