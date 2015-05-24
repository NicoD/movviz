/**
 * movie repository module
 * @module repository/movie
 */
'use strict';


var ObjectID = require('mongodb').ObjectID,

  /**
   * MovieRepository
   * centralize data access
   *
   * @class
   * @param {Object} MongoDb access
   */
  Repository = function(storage) {


    /**
     * Callback used when result is ready
     * @callback module:repository/movie~Repository~onFound
     * @param {String} err
     * @param {Object} result
     */

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
     * @param {module:utils/pagination~Pagination} pagination
     * @param {module:repository/movie~Repository~onFound}
     */
    this.find = function(criteria, pagination, onFound) {
      var results = collection.find(criteria);
      if(!pagination || !pagination.applyTo) {
        return onFound(null, results);
      }
      results.count(function(err, count) {
        if(err) {
          return onFound(err);
        }
        pagination.applyTo(results, count);
        onFound(null, results);
      });
    };


    /**
     * return one result by its id
     * @param {id} id
     * @param {module:repository/movie~Repository~onFound}
     */
    this.getById = function(id, onFound) {
      var objectId = new ObjectID(id);
      collection.findOne({
        _id: objectId
      }, onFound);
    };

  };


/**
 * Movie repository factory
 * @return {module:respository/movie~Repository}
 */
module.exports.create = function(storage) {
  return new Repository(storage);
};