'use strict';
var mongoose = require('mongoose');
var moment = require('moment');

var Schema = mongoose.Schema;

var galleriesSchema = new Schema({
    name: { type: String }, //This name is unique in galleries collection
    title: { type: String },
    story: { type: String },
    thumbnail: { type: Schema.Types.ObjectId, ref: 'Images'},
    createTime: { type: Date, 'default': Date.now },
    updateTime: { type: Date, 'default': Date.now },
    owner: { type: Schema.Types.ObjectId, ref: 'Users'},
    images: [{type: Schema.Types.ObjectId, ref: 'Images'}]
});

galleriesSchema.virtual('createDate')
    .get(function () {
        return moment(this.createTime).format('YYYY年M月DD日');
    });
galleriesSchema.virtual('updateDate')
    .get(function () {
        return moment(this.updateTime).format('YYYY年M月DD日');
    });

var Galleries = mongoose.model('Galleries', galleriesSchema);

module.exports = Galleries;
