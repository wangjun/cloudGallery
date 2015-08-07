'use strict';
var handyObject = {};

handyObject.concat = function (objectsArray, cb) {
    var callback = cb || function(){};
    var result = {};
    for (let i = 0; i < objectsArray.length; i++) {
        if (typeof objectsArray[i] === 'object') {
            for (var key in objectsArray[i]) {
                if (objectsArray[i].hasOwnProperty(key)) {
                    if(result.hasOwnProperty(key)){
                        throw new Error('It is not allow to concat with objects have same property name.');
                    }else{
                        result[key] = objectsArray[i][key];
                    }
                }
            }
        } else {
            throw new TypeError('values must be Objects.');
        }
    }
    callback(result);
    return result;
};

module.exports = handyObject;
