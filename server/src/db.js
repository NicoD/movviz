/**
 * separate db connection module used for dependancy injection
 * @module db
 */
'use strict';


var path = require('path'),
  yaml = require('js-yaml'),
  fs = require('fs'),
  mongoose = require('mongoose');


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
 * @param {callback}
 */
module.exports.connect = function(cb) {

  fs.readFile(configFile, function(err, data) {
    if(err) {
      return cb(err);
    }

    var doc = yaml.safeLoad(data),
      line = 'mongodb://' + doc.host + ':' + doc.port + '/' + doc.database;
    try {
      cb(null, mongoose.createConnection(line));
    } catch(e) {
      cb(e);
    }

  });
};