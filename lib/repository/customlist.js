/**
 * custom list repository module
 * @module repository/customlist
 */
'use strict';

var movieAgregationRepositoryFactory = require('./movie/aggregation'),
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
          ['periods',   ['best-periods', 'worst-periods', 'watched-periods']]
        ];

        async.each(defaultAggregationLists, function(listCategory, callbackListCategory) {
          async.each(listCategory[1], function(list, callbackList) {
            var listDetail = movieAgregationRepositoryFactory.getList(listCategory[0], list);
            collection.insert(
              {
                'name': listDetail.name, 
                'slug': list,
                'list-type': "aggregation",
                'list-name': list
              },
              callbackList
            );
          }, callbackListCategory);
        }, 


        function(err) {
          if(err) { return err; }
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
  };


/**
 * Customlisti repository factory
 * @return {module:respository/customlist~Repository}
 */
module.exports.create = function(storage) {
  return new Repository(storage);
};
