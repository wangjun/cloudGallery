'use strict';
var handyObject = {};

handyObject.concat = function (objects) {
    var result = {};
    for (let i = 0; i < objects.length; i++) {
        if (typeof objects[i] === 'object') {
            for (var key in objects[i]) {
                if (objects[i].hasOwnProperty(key)) {
                    if(result.hasOwnProperty(key)){
                        throw new Error('It is not allow to concat with objects have same property name.');
                    }else{
                        result[key] = objects[i];
                    }
                }
            }
        } else {
            throw new TypeError('values must be Objects.');
        }
    }
    return result;
};

module.exports = handyObject;
