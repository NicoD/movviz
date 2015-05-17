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
   * prepare the storage
   * doc example:
   *  {
   *    _id:ObjectId("507f1f77bcf86cd799439011")
   *    seenAt: new Date('Jun 15, 2015'),
   *    genre: [ "Drama", "Horror"],
   *    directors: [
   *      {
   *        name: "Steven Spielberg"
   *      },
   *      {
   *        name: "George Lucas"
   *      }
   *    ],
   *    rating: 7.5,
   *    runtime: 140,
   *    year: 1998,
   *    imdb: {
   *      id: "tt3297330",
   *      url: "http://www.imdb.com/title/tt3297330/",
   *      rating: 6.3,
   *      updateDatedAt: new Date('Jul 03, 2015')
   *    }
   *  }
   */
  this.install = function(onInstalled) {
    collection.drop(function(err) {
      if(err) {
        return onInstalled(err);
      }

      collection.createIndex({
        "imdb.id": 1
      }, {
        unique: 1
      }, function(err) {
        if(err) {
          return onInstalled(err);
        }
        collection.createIndex({
          "year": 1
        }, function(err) {
          if(err) {
            return onInstalled(err);
          }
          collection.createIndex({
            "genre": 1
          }, function(err) {
            if(err) {
              return onInstalled(err);
            }
            collection.createIndex({
              "rating": 1
            }, function(err) {
              return onInstalled(err);
            });
          });
        });
      });
    });
  };

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