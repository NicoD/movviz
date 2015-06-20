/**
 * movie model module
 * @module model/movie
 */
'use strict';


var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  StringUtil = require('../utils/string'),
  AggregationModel = require('./movie/aggregation');


var DirectorSchema = new Schema({
  _id: String,
  name_order: String,
  name: String
});
var GenreSchema = new Schema({
  _id: String,
  label: String
});

var RatingType = {
  type: Number,
  min: 0,
  max: 10
};
var MovieSchema = new Schema({
  user: {
    type: Schema.ObjectId,
    ref: 'UserSchema',
    index: true
  },
  slug: {
    type: String,
    index: true
  },
  title_ordered: String,
  title: String,
  genres: {
    type: [GenreSchema],
    index: true
  },
  directors: {
    type: [DirectorSchema],
    index: true
  },
  rating: RatingType,
  runtime: {
    type: Number,
    min: 1,
    max: 1440
  },
  year: {
    type: Number,
    min: 1850,
    max: new Date().getFullYear() + 10,
    index: true
  },
  watch_the: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
  imdb: {
    _id: String,
    url: String,
    rating: RatingType,
    updated_at: {
      type: Date,
      defaumt: Date.now
    }
  }
}, {
  collection: 'movie'
});

// not a perfect "uniqueness" of a movie, but a conflit management will be set up for that
MovieSchema.index({ user: 1, slug: 1}, { unique: true });

// save preprocessing
// apply slug and basic string/number transformation
MovieSchema.pre('save', function(next) {
  this.slug = this.year + '-' + StringUtil.slugify(this.title);
  this.title_order = StringUtil.orderify(this.title);

  var i;
  for(i = 0; i < this.directors.length; i++) {
    var director = this.directors[i];
    director._id = StringUtil.slugify(director.name);
    director.name_order = StringUtil.orderify(director.name, true);
  }
  for(i = 0; i < this.genres.length; i++) {
    var genre = this.genres[i];
    genre._id = StringUtil.slugify(genre.label);
  }

  this.rating = Math.round(this.rating * 100) / 100;
  this.imdb.rating = Math.round(this.imdb.rating * 100) / 100;
  next();
});


/**
 * return one result by its id
 * @param {String} id
 * @param {callback}
 */
MovieSchema.statics.findById = function(id, cb) {
  this.findOne({
    _id: mongoose.Types.ObjectId(id)
  }, cb);
};


/**
 * return all the results
 * @param {Object} criteria - search criteria
 * @param {Object} pagination
 * @param {callback}
 */
MovieSchema.statics.findWithPagination = function(criteria, pagination, cb) {
  var query = this.find(criteria);
  if(!pagination || !pagination.applyTo) {
    return cb(null, query);
  }
  this.find(criteria).count(function(err, count) {
    if(err) {
      return cb(err);
    }
    pagination.applyTo(query, count);
    cb(null, query);
  });
};


/**
 * return aggregated list
 * @param {Object} customlist
 * @param {Object} pagination
 * @return {Object} cursor
 * @return {cb}
 */
MovieSchema.statics.getAggregatedResults = function(customlist, pagination, cb) {
  var rule = AggregationModel.get(customlist['list-name'], true),
    list = AggregationModel.get(customlist['list-name']);

  customlist['list-format'] = list.format;

  switch(rule.type) {
    case 'map-reduce':
      rule.mapReduce(customlist.user.valueOf(), this, function(err, ResultModel) {
        if(err) {
          return cb(err);
        }
        var filter = {};
        if(list.format == 'avg') {
          filter = {
            "value.count": {
              $gte: 4
            }
          };
        }
        var results = ResultModel.find(filter)
          .sort(JSON.parse(list.sort));
        if(!pagination || !pagination.applyTo) {
          return cb(null, results);
        }
        ResultModel.find(filter).count(function(err, count) {
          if(err) {
            return cb(err);
          }
          pagination.applyTo(results, count);
          cb(null, results);
        });
      });
      break;

    default:
      throw new Error('aggregation \'' + rule.type + '\' not supported');
  }
};


/**
 * Movie model factory
 * @param {Object}
 * @return {Object}
 */
module.exports.create = function(conn) {
  return conn.model('Movie', MovieSchema);
};
