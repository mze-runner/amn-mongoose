'use strict';

const mongoose = require('mongoose');
const debug = require('debug')('amn:mongoose');

// validate db config input whether everything in place, list of must have keys...
const dbConfigMustHave = 'authentication host port db user password';

// helper function... simply build connection string.
const _buildConnectionString = function ( { host, port, db, authentication, user, password } ) {
    return authentication === 'password' 
    ? `mongodb://${user}:${password}@${host}:${port}/${db}`
    : `mongodb://${host}:${port}/${db}`;
};

// helper function to validate whether all values in place to setup a connection. 
const _validate = (must, input) => {
    const mustArray = must.split(/ /);
    const errors = [];
    mustArray.forEach(element => {
        if(!input.hasOwnProperty(element)){
            errors.push(element);
        }
    });
    return errors;
}

const open = ({ host, port, db, authentication, user, password}) => {

    const err = _validate(dbConfigMustHave, dbs[db]);
    if(err.length){
        debug('Invalid connection parameters. Missing fields %s', err.toString());
        throw new Error('Invalid connection parameters. Missing fields %s', err.toString());
    }

    const connString = _buildConnectionString( { host, port, db, authentication, user, password } );
    const conn = mongoose.createConnection(connString, { useCreateIndex : true, useFindAndModify : false, useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
        if(err) {
            debug('INSTANCE SHUTDOWN: DB %s CONNECT ERROR: %s' , host, err.message);
            process.exit(1);// close node instance...
        }
    });

    conn.on('error', (err) => {
        debug('DB %s connection fail with %s', host, err.message);
        process.exit(1);// close node instance...
    });

    conn.once('connected', () => {
        debug('db connection to (%s/%s) established!', host,db);
    });

    conn.once('open', function() {
        debug('db connection to (%s/%s) open...', host, db);
    });

    conn.once('close', function() {
        debug('db connection to %s closed...', host);
        process.exit(1);
    });

    return conn;
}
const close = (conn) => conn.close();

// export the singleton API only, 
// everything else behind the scene...
module.exports = { open, close };