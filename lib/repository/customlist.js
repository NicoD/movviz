/**
 * custom list repository module
 * @module repository/customlist
 */
'use strict';

var movieAggregationRepFactory = require('./movie/aggregation'),
  async = require('async'),
  dbUtil = require('../utils/db'),
  ObjectID = require('mongodb').ObjectID,

  /**
   * CustomListRepository
   * centralize data access
   *
   * @class
   * @param {Object} MongoDb access
   */
  Repository = function(storage) {


    /**
     * Callback used when result is ready
     * @callback module:repository/customlistmovie~Repository~onFound
     * @param {String} err
     * @param {Object} result
     */

    var collection = storage.collection('customlist');

    /**
     * prepare the storage
     * doc example:
     *  {
     *    _id:ObjectId("507f1f77bcf86cd799439011")
     *    name: "my list",
     *    slug: "my-list",
     *    list-type: "aggregation",
     *    list-name: "best-directors",
     *  }
     */
    this.install = function(onInstalled) {
      dbUtil.dropIfExists(storage, 'customlist', function(err) {
        if(err) {
          return onInstalled(err);
        }

        var defaultAggregationLists = [
          ['directors', ['best-directors', 'worst-directors', 'directors-per-movie-seen']],
          ['periods', ['best-periods', 'worst-periods', 'watched-periods']]
        ];

        async.each(defaultAggregationLists, function(listCategory, callbackListCategory) {
            async.each(listCategory[1], function(list, callbackList) {
              var listPath = listCategory[0] + ':' + list;
              var listDetail = movieAggregationRepFactory.get(listPath);
              collection.insert({
                  'name': listDetail.name,
                  'slug': list,
                  'list-type': "aggregation",
                  'list-name': listPath
                },
                callbackList
              );
            }, callbackListCategory);
          },


          function(err) {
            if(err) {
              return err; 
            }
            collection.createIndex({
              "slug": 1
            }, {
              unique: 1
            }, function(err) {
              return onInstalled(err);
            });
          });
      });
    };


    /**
     * return all the results
     * @param {Object} criteria - search criteria
     * @param {module:utils/pagination~Pagination} pagination
     * @param {module:repository/customlist~Repository~onFound}
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
  };


/**
 * Customlisti repository factory
 * @return {module:respository/customlist~Repository}
 */
module.exports.create = function(storage) {
  return new Repository(storage);
};