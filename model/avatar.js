'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var avatarSchema = new Schema({
    user: {type: Schema.Types.ObjectId, ref: 'Users'},
    hash: {type: String},
    key: {type: String},
    src: {type: String}
});
var avatar = mongoose.model('Avatar', avatarSchema);
module.exports = avatar;
