'use strict';

const mongodb = require('./mongodb');

// get or create global unique symbol name ... 
const GLOBAL_DBS_KEY = Symbol.for("app.dbs");

// check if the global object has this symbol
// add it if it does not have the symbol, yet
const globalSymbols = Object.getOwnPropertySymbols(global);
const hasDbs = (globalSymbols.indexOf(GLOBAL_DBS_KEY) > -1);

// init global object if not yet done...
if(!hasDbs){
    global[GLOBAL_DBS_KEY] = {};
}

// define the singleton API
var singleton = {};

singleton.open = async function(alias, db){
    if(typeof dbs !== 'object'){
        throw new Error('Dbs list is not object.');
    }
    if(!alias || typeof(alias) !== 'string'){
        throw new Error('Invalid alias, must be a string');
    }
    const openConnection = mongodb.open(db);
    global[GLOBAL_DBS_KEY][alias] = openConnection;
}

singleton.close = (alias) => {
    const conn = singleton.get(alias);
    mongodb.close(conn);
}

singleton.get = function(alias){
    if(!global[GLOBAL_DBS_KEY] || !global[GLOBAL_DBS_KEY][alias]){
        throw new Error('Database not found...');
    }
    return global[GLOBAL_DBS_KEY][alias];
}

// ensure the API is never changed
Object.freeze(singleton);

// export the singleton API only, 
// everything else behind the scene...
module.exports = singleton;