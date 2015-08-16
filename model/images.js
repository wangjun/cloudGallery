'use strict';
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var imagesSchema = new Schema({
    hash: { type: String},
    key: { type: String},
    title: { type: String },
    story: { type: String },
    fileName: { type: String},
    belongGalleries: [{ type: Schema.Types.ObjectId, ref: 'Galleries'}],
    createTime: { type: Date, 'default': Date.now },
    owners: [{ type: Schema.Types.ObjectId, ref: 'Users'}],
    state: {
        fsize: {type: Number},
        hash: {type: String},
        mimeType: {type: String},
        putTime: {type: Number}
    }
});

imagesSchema.statics.updateState = function (fsize, hash, mimeType, putTime) {
    console.log(fsize, hash, mimeType, putTime);
};


var Images = mongoose.model('Images', imagesSchema);

module.exports = Images;
