'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var articlesSchema = new Schema({
    title: { type: String },
    creator: { type: Schema.Types.ObjectId },
    author: { type: String },
    createDate: { type: Date, 'default': Date.now },
    content: { type: String }
});
var Articles = mongoose.model('Articles', articlesSchema);
module.exports = Articles;
