'use strict';
var Avatar = require('../../model/avatar');
var Users = require('../../model/users');
var libQiniu = require('../qiniu/qiniu');
var libLog = require('../admin/log');
var libRequest = require('../handy/request');
var libConfig = require('../admin/config');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var qiniu = require('qiniu');
var path = require('path');
var user = {};
/**
 * This function will first download the image by passing the image url address.
 * Then upload it to Qiniu CDN server. At last this function will save the key and has
 * into local server database.
 * @param url
 * @param userId
 * @param savedCB
 */
user.saveAvatarByUrl = function (url, userId, savedCB) {
    var savedCallback = savedCB || function(){};
    //upload file to qiniu cdn server
    var uploadFileToQiniu = function (cb) {
        var dest = path.join(__dirname, '../../public/images/avatar/' + userId + '.jpg');
        libRequest.downloadImage(url, dest, function () {
            var callback = cb || function(){};
            var uptoken = libQiniu.genUptoken('lazycoffeeuseravatar');
            var extra = new qiniu.io.PutExtra();
            //var key = userId + '.' + type;
            qiniu.io.putFile(uptoken, null, dest, extra, function (err, ret) {
                if(err){return libLog.add(
                    'error',
                    'Occur an error when uploading avatar to qiniu cdn server. This error is caused by cdn server not by Lazycoffee',
                    'Error when upload avatar.');
                }
                callback(ret, dest);
            });
        });
    };
    var saveAvatar = function (cb) {
        var callback = cb || function(){};
        uploadFileToQiniu(function (ret, dest) {
            var newAvatar = new Avatar({
                user: new ObjectId(userId),
                hash: ret.hash,
                key: ret.key,
                src: dest
            });
            newAvatar.save(function (saveAvatarErr, savedAvatar) {
                if(saveAvatarErr){return libLog.add('error', JSON.stringify(saveAvatarErr), 'Save avatar error'); }
                if(savedAvatar){
                    console.log('Avatar saved');
                    callback(savedAvatar);
                }else{
                    libLog.add('error', 'Can not save avatar.', 'Save avatar error.');
                }
            });
        });
    };
    saveAvatar(savedCallback);
};

/**
 * Get avatar url (as CDN or local) from database.
 * @param userId
 * @param cb
 */
user.getAvatar = function (userId, cb) {
    var callback = cb || function(){};
    var userObjectId = typeof userId === 'object' ? userId : new ObjectId(userId);
    Avatar.findOne({user: userObjectId}, function (findAvatarErr, foundAvatar) {
        if(findAvatarErr){return libLog.add('error', JSON.stringify(findAvatarErr), 'Find avatar error'); }
        if(foundAvatar){
            foundAvatar.cdn = libConfig.cdn.qiniu.AvatarPrefix + '/' + foundAvatar.key;
            callback(foundAvatar);
        }else{
            return libLog.add('error', 'Can not find avatar.', 'Find avatar error.');
        }
    });
};

/**
 * get user info from userObject and store into session.
 * @param userObject
 * @param request
 */

user.login = function (userObject, request) {
    request.session.user = {
        _id: userObject._id,
        name: userObject.name,
        type: userObject.type
    };
};

module.exports = user;
