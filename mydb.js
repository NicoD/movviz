/**
 * separate db connection module used for dependancy injection
 * @module mydb
 */
'use strict';

var MongoClient = require('mongodb').MongoClient;

exports.connect = function(onConnect) {
  MongoClient.connect('mongodb://localhost:27017/movviz', onConnect);
};
