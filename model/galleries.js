'use strict';
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var galleriesSchema = new Schema({
    name:{ type: String }, //This name is unique in galleries collection
    title: { type: String },
    story: { type: String },
    thumbnail:{ type: Schema.Types.ObjectId, ref:'Images'},
    createTime: { type: Date, 'default': Date.now },
    updateTime: { type: Date, 'default': Date.now },
    owner:  { type: Schema.Types.ObjectId, ref: 'Users'},
    images: [{type: Schema.Types.ObjectId, ref: 'Images'}]
});


var Galleries = mongoose.model('Galleries', galleriesSchema);

module.exports = Galleries;