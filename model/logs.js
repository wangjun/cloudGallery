'use strict';
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var logsSchema = new Schema({
    title: { type: String },
    content: { type: String },
    type: { type: String },
    create: { type: Date, 'default': Date.now },
    uri: { type: String},
    level: { type: Number, 'default': 0}
});


var Logs = mongoose.model('Logs', logsSchema);

module.exports = Logs;
