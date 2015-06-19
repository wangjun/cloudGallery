'use strict';
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var galleriesSchema = new Schema({
    title: { type: String},
    story: { type: String},
    createTime: { type: Date, default: Date.now },
    updateTime: { type: Date, default: Date.now },
    owner:  { type: Schema.Types.ObjectId, ref:'Users'}
});


var Galleries = mongoose.model('Galleries', galleriesSchema);

module.exports = Galleries;