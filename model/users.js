'use strict';
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var Schema = mongoose.Schema;

var usersSchema = new Schema({
    name: { type: String, default: 'NotSet' },
    email: { type: String, default: 'NotSet' },
    mobile: { type: String, default:'NotSet' },
    hashed_password: { type: String, default: 'NotSet' },
    salt: { type: String, default: 'NotSet' },
    authToken: { type: String, default: 'NotSet' },
    register_time: { type: Date, default: Date.now },
    type:{ type:String, default:'RegisteredUser' },
    galleries:[{ type:Schema.Types.ObjectId, ref:'Galleries' }]
});


/**
 * Virtuals
 */

usersSchema
    .virtual('password')
    .set(function(password) {
        var salt = bcrypt.genSaltSync(12);
        this._password = password;
        this.salt = salt;
        this.hashed_password = bcrypt.hashSync(password, salt);
    })
    .get(function() { return this._password; });


var Users = mongoose.model('Users', usersSchema);

module.exports = Users;