/**
 * Db utils
 * @module utils/db
 */
'use strict';


/**
 * collection find result callback
 * @param {String} err
 * @param {boolean} found
 */

/**
 * collection droped if exists callback
 * @param {String} err
 */


/**
 * find if a collection exists in the given db
 * @param {Object} db
 * @param {String} collectionName
 * @param {module:utils/db:onExistsFound}
 */
var collectionExists = function(db, collectionName, callback) {
  var collectionCursor = db.listCollections({
    listCollections: 1
  });
  var checkObject = function(err, object) {
    if(err) {
      return callback(err);
    }
    if(object === null) {
      return callback(null, false);
    }
    if(String(object.name) == collectionName) {
      return callback(null, true);
    }
    collectionCursor.nextObject(checkObject);
  };
  collectionCursor.nextObject(checkObject);
};

/**
 * find if a collection exists in the given db
 * @param {Object} db
 * @param {String} collectionName
 * @param {module:utils/db:onExistsFound}
 */
module.exports.collectionExists = collectionExists;


/**
 * drop a collection only if it exists
 * @param {Object} db
 * @param {String} collectionName
 * @param {module:utils/db:onDropIfExists}
 */
var dropIfExists = function(db, collectionName, callback) {
  collectionExists(db, collectionName, function(err, exists) {
    if(err) {
      return callback(err);
    }
    if(exists) {
      db.collection(collectionName).drop(callback);
    } else {
      callback();
    }
  });
};

/**
 * drop a collection only if it exists
 * @param {Object} db
 * @param {String} collectionName
 * @param {module:utils/db:onDropIfExists}
 */
module.exports.dropIfExists = dropIfExists;
