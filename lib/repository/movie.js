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
   * @param {onStored}
   */
  this.store = function(movie, onStored) {
    collection.insert(movie, onStored);
  };

  /**
   * return the total in the db
   * @param {onCount}
   */
  this.count = function(onCount) {
    collection.count(onCount);
  };

  /**
   * return all the results
   * @param {Object} criteria - search criteria
   * @return cursor
   */
  this.find = function(criteria) {
    return collection.find(criteria);
  };

};


/**
 * Movie repository factory
 * @return {module:respository/movie~Repository}
 */
module.exports.create = function(storage) {
  return new Repository(storage);
};
