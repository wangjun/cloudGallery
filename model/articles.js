'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var articlesSchema = new Schema({
    title: { type: String, default: 'BlankTitle' },
    content: { type: String}
});
var Articles = mongoose.model('Articles', articlesSchema);
module.exports = Articles;
