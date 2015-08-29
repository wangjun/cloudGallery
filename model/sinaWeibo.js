'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var sinaWeiboSchema = new Schema({
    //access info
    access_token: {type: String},
    uid: {type: String},
    expires_in: {type: String},
    expireDate: {type: Date},
    appkey: {type: String},
    scope: {type: String},
    create_at: {type: String},
    //weibo info
    weiboInfo: {type: Schema.Types.Mixed},
    //reference user model
    user: {type: Schema.Types.ObjectId, ref: 'Users'}
});
var sinaWeibo = mongoose.model('SinaWeibo', sinaWeiboSchema);
module.exports = sinaWeibo;
