/**
 * separate db connection module used for dependancy injection
 * @module db
 */
'use strict';


var path = require('path'),
    yaml = require('js-yaml'),
    fs   = require('fs'),
    MongoClient = require('mongodb').MongoClient;


/**
 * Callback used when the database is connected
 * @callback module:db~onConnected
 * @param {String} err
 * @param {Object} connection - (mongodb) connection
 */


/**
 * connect to the database
 *
 * @param {module:db~onConnected}
 */
module.exports.connect = function(onConnected) {

  fs.readFile(path.dirname(require.main.filename) + '/config/database.yaml', function(err, data) {
    if(err) { return onConnected(err); }

    var doc = yaml.safeLoad(data),
        line = 'mongodb://' + doc.host + ':' + doc.port + '/' + doc.database;
    MongoClient.connect(line, onConnected);
  });
};
