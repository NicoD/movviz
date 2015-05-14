/**
 * movie repository module
 * @module repository/movie
 */
'use strict';

/**
 * MovieRepository
 * centralize data access
 *
 * @class
 * @param {Object} MongoDb access
 */
var Repository = function(storage) {

  var collection = storage.collection('movie');

  /**
   * store the given movie
   * @param {Object} movie
   * @param {onStoredCb}
   */
  this.store = function(movie, onStored) {
    collection.insert(movie, onStored);
  };

  /**
   * return the total in the db
   * @param {onCountCb}
   */
  this.count = function(onCount) {
    collection.count(onCount);
  };

  /**
   * return all the results
   * @return cursor
   */
  this.find = function() {
    return collection.find();
  };

};


/**
 * Movie repository factory
 * @return {module:respository/movie~Repository}
 */
module.exports.create = function(storage) {
  return new Repository(storage);
};