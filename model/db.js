/**
 * Created by jamesying on 15/5/1.
 */
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
    // yay!
});