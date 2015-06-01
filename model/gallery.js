'use strict';
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var albumsSchema = new Schema({
    title: { type: String},
    story: { type: String},
    createTime: { type: Date, default: Date.now },
    updateTime: { type: Date, default: Date.now },
    owner:  { type: Schema.Types.ObjectId,ref:'Users'}
});


var Albums = mongoose.model('Albums', albumsSchema);

module.exports = Albums;