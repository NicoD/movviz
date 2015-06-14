/**
 * separate db connection module used for dependancy injection
 * @module db
 */
'use strict';


var path = require('path'),
  yaml = require('js-yaml'),
  fs = require('fs'),
  mongoose = require('mongoose');


/**
 * Callback used when the database is connected
 * @callback module:db~onConnected
 * @param {String} err
 * @param {Object} connection - (mongoose) connection
 */

var configFile = path.dirname(require.main.filename) + '/config/database.yaml';


/**
 * override the defaut database config file
 * @param {String} fileName
 */
module.exports.setConfigFileName = function(fileName) {
  configFile = fileName;
};


/**
 * connect to the database
 *
 * @param {module:db~onConnected}
 */
 module.exports.connect = function(onConnected) {

  fs.readFile(configFile, function(err, data) {
    if(err) {
      return onConnected(err);
    }

    var doc = yaml.safeLoad(data),
      line = 'mongodb://' + doc.host + ':' + doc.port + '/' + doc.database;
    try {
      onConnected(err, mongoose.createConnection(line));
    } catch(e) {
      onConnected(e);
    }

  });
};
