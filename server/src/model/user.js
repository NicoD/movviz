/**
 * user model module
 * @module model/user
 */
'use strict';


var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var UserSchema = new Schema({
  email: {
    type: String,
    unique: true,
    lowercase: true
  },
  displayName: String,
  picture: String,
  google: String
}, {collection: 'user' });


/**
 * user model factory
 * @param {Object}
 * @return {Object}
 */
module.exports.create = function(conn) {
  return conn.model('User', UserSchema);
};
