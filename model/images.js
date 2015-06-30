'use strict';
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var imagesSchema = new Schema({
    hash: { type: String},
    key: { type: String},
    belongGalleries: [{ type: Schema.Types.ObjectId, ref:'Galleries'}],
    createTime: { type: Date, default: Date.now },
    owners:  [{ type: Schema.Types.ObjectId, ref:'Users'}]
});


var Images = mongoose.model('Images', imagesSchema);

module.exports = Images;