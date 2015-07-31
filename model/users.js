'use strict';
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var Schema = mongoose.Schema;

var usersSchema = new Schema({
    name: { type: String },
    email: { type: String },
    mobile: { type: String },
    hashedPassword: { type: String },
    salt: { type: String },
    authToken: { type: String },
    registerTime: { type: Date, 'default': Date.now },
    type: { type: String, 'default': 'RegisteredUser' },
    galleries: [{ type: Schema.Types.ObjectId, ref: 'Galleries' }]
});
/* methods */
usersSchema.methods.checkPassword = function (inPassword, cb) {
    var callback = cb || function(){};
    var user = this;
    var salt = user.salt;
    var blankFunction = function () {};
    console.log(user);
    bcrypt.hash(inPassword, salt, blankFunction, function(hashErr, encrypted) {
        if(hashErr){return hashErr; }
        if(encrypted){
            var isPasswordCorrect = (encrypted === user.hashedPassword);
            callback(isPasswordCorrect);
        }else{
            console.log('can not generate hash code. I do not know why.');
        }
    });
};

/**
 * Virtuals
 */

usersSchema
    .virtual('password')
    .set(function(password) {
        var salt = bcrypt.genSaltSync(12);
        this._password = password;
        this.salt = salt;
        this.hashedPassword = bcrypt.hashSync(password, salt);
    })
    .get(function() { return this._password; });


var Users = mongoose.model('Users', usersSchema);

module.exports = Users;
