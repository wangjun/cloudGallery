'use strict';
var mongoose = require('mongoose');
var logs = require('../lib/admin/log');
var moment = require('moment');
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
    exif: {
        DateTime: {type: Date}
    },
    state: {
        fsize: {type: Number},
        hash: {type: String},
        mimeType: {type: String},
        putTime: {type: Number}
    }
});
imagesSchema.virtual('DateFormatted')
    .get(function () {
        return moment(this.exif.DateTime).format('YYYY年M月DD日');
    });
imagesSchema.statics.updateState = function (_id, fsize, hash, mimeType, putTime) {
    this.findOneAndUpdate({_id: _id}, {
        $set: {
            state:
            {
                fsize: fsize,
                hash: hash,
                mimeType: mimeType,
                putTime: putTime
            }
        }
    }, function(updateImageErr, updatedImage){
        if(updateImageErr){return logs.add('err', JSON.stringify(updateImageErr), 'updateImageErr'); }
        console.log(updatedImage);
    });
};
var Images = mongoose.model('Images', imagesSchema);
module.exports = Images;
