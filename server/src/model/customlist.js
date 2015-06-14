/**
 * customlist model module
 * @module model/customlist
 */
'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
  AggregationModel = require('./movie/aggregation'),
  async = require('async'),
  StringUtil = require('../utils/string');



var CustomlistSchema = new Schema({
  slug: {type: String, index: true},
  name: String,
  'list-type': {type: String, enum: ['aggregation']},
  'list-name': String
}, { collection: 'customlist'});


CustomlistSchema.pre('save', function(next) {
  this.slug = StringUtil.slugify(this.name);
  next();
});


/**
 * return all the results
 * @param {Object} criteria - search criteria
 * @param {Object} pagination
 * @param {callback}
 */
CustomlistSchema.statics.getResults = function(criteria, pagination, cb) {
  var query = this.find(criteria);
  if(!pagination || !pagination.applyTo) {
    return query.exec(cb);
  }
  query.count(function(err, count) {
    if(err) {
      return cb(err);
    }
    pagination.applyTo(query, count);
    query.exec(cb);
  });
};


/**
 * return one results by its slug
 * @param {String} slug
 * @param {callback}
 */
CustomlistSchema.statics.getBySlug = function(slug, cb) {
  this.findOne({slug: slug}, cb);
};


/**
 * Customlist model factory
 * @param {Object}
 * @return {Object}
 */
module.exports.create = function(conn) {
  return conn.model('Customlist', CustomlistSchema);
};

/**
 * installation of the Customlist
 * @param {Object}
 * @param {callback}
 */
module.exports.install = function(conn, cb) {
  var CustomlistModel = conn.model('Customlist', CustomlistSchema);
  CustomlistModel.remove({}, function(err) {
    if(err) {
      return cb(err);
    }

    var defaultAggregationLists = [
      ['directors', ['best-directors', 'worst-directors', 'directors-per-movie-seen']],
      ['periods', ['best-periods', 'worst-periods', 'watched-periods']]
    ];

    async.each(defaultAggregationLists, function(listCategory, callbackListCategory) {
      async.each(listCategory[1], function(list, callbackList) {
          var listPath = listCategory[0] + ':' + list;
          var listDetail = AggregationModel.get(listPath);
          new CustomlistModel({
              'name': listDetail.name,
              'list-type': "aggregation",
              'list-name': listPath
            }).save(callbackList);
          }, callbackListCategory);
      }, cb);
  });
};
