'use strict';

var mongoose = require('mongoose');

/* global emit */


var aggregation = {
  'directors': {
    'type': 'map-reduce',
    'description': 'general aggregation per directors',
    'mapReduce': function(userId, MovieModel, callback) {
      var tmpCollectionName = 'tmp_director';
      MovieModel.mapReduce({
          map: function() {
            for(var idx = 0; idx < this.directors.length; idx++) {
              var key = this.directors[idx].name;
              if(!key) {
                continue;
              }
              var value = {
                count: 1,
                total: parseInt(this.rating)
              };
              emit(key, value);
            }
          },
          reduce: function(key, values) {
            var reducedVal = {
              count: 0,
              total: 0
            };
            for(var idx = 0; idx < values.length; idx++) {
              reducedVal.count += values[idx].count;
              reducedVal.total += values[idx].total;
            }
            return reducedVal;
          },
          query: {
            user: mongoose.Types.ObjectId(userId)
          },
          out: tmpCollectionName,
          finalize: function(key, reducedVal) {
            reducedVal.avg = reducedVal.total / reducedVal.count;
            reducedVal.avg = Math.round(reducedVal.avg * 100) / 100;
            return reducedVal;
          }
        },
        callback
      );
    },
    'lists': {
      'best-directors': {
        'format': 'avg',
        'name': 'best directors',
        'sort': '{"value.avg": -1 }'
      },
      'worst-directors': {
        'format': 'avg',
        'name': 'worst directors',
        'sort': '{"value.avg": 1 }'
      },
      'directors-per-movie-seen': {
        'format': 'count',
        'name': 'directors per movie seen',
        'sort': '{"value.count": -1}'
      }
    }
  },

  'periods': {
    'type': 'map-reduce',
    'description': 'general aggregation per period',
    'mapReduce': function(userId, MovieModel, callback) {
      var tmpCollectionName = 'tmp_period';
      MovieModel.mapReduce({
          map: function() {
            if(!this.year) {
              return;
            }
            var period = this.year - this.year % 10;
            var value = {
              count: 1,
              total: parseInt(this.rating)
            };
            emit(period, value);
          },
          reduce: function(key, values) {
            var reducedVal = {
              count: 0,
              total: 0
            };
            for(var idx = 0; idx < values.length; idx++) {
              reducedVal.count += values[idx].count;
              reducedVal.total += values[idx].total;
            }
            return reducedVal;
          },
          query: {
            user: mongoose.Types.ObjectId(userId)
          },
          out: tmpCollectionName,
          finalize: function(key, reducedVal) {
            reducedVal.avg = reducedVal.total / reducedVal.count;
            reducedVal.avg = Math.round(reducedVal.avg * 100) / 100;
            return reducedVal;
          }
        },
        callback
      );
    },
    'lists': {
      'best-periods': {
        'format': 'avg',
        'name': 'best period',
        'sort': '{"value.avg": -1 }'
      },
      'worst-periods': {
        'format': 'avg',
        'name': 'worst period',
        'sort': '{"value.avg": 1 }'
      },
      'watched-periods': {
        'format': 'count',
        'name': 'most movies seens',
        'sort': '{"value.count": -1}'
      }
    }
  }
};


/**
 * return a whole aggregation rule or the list
 * @param {String} aggregationRule
 * @param {boolean} ruleOnly
 * @return {Object}
 */
module.exports.get = function(aggregationRule, ruleOnly) {
  var elem = aggregationRule.split(':');
  var ret = null;
  if(elem[0]) {
    ret = aggregation[elem[0]];
  }
  if(elem[1] && !ruleOnly) {
    ret = ret.lists[elem[1]];
  }
  return ret;
};