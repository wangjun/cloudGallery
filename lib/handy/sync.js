'use strict';
var processes = {};

processes.syncFunctions = function*(functions){
    for(let value of functions){
        yield value();
    }
};

module.exports = processes;
