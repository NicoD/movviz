'use strict';

/* global emit */

var aggregation = {
  'directors': {
    'type': 'map-reduce',
    'description': 'general aggregation per directors',
    'mapReduce': function(collection) {
        return collection.mapReduce(
        function() {
          for(var idx = 0; idx < this.directors.length; idx++) {
            var key = this.directors[idx].name;
            var value = {
              count: 1,
              total: parseInt(this.rating)
            };
            emit(key, value);
          }
        },
        function(key, values) {
          var reducedVal = {
            count: 0,
            total: 0
          };
          for(var idx = 0; idx < values.length; idx++) {
            reducedVal.count += values[idx].count;
            reducedVal.total += values[idx].total;
          }
          return reducedVal;
        }, {
          query: {},
          finalize: function(key, reducedVal) {
            reducedVal.avg = reducedVal.total / reducedVal.count;
            return reducedVal;
          }
        }
      );
    },
    'lists': {
      'best-directors': {
        'name': 'best directors',
        'sort': '{"value.avg": -1 }'
      },
      'worst-directors': {
        'name': 'worst directors',
        'sort': '{"value.avg": 1 }'
      },
      'directors-per-movie-seen': {
        'name': 'directors per movie seen',
        'sort': '{"value.count": -1}'
      }
    }
  },

  'periods': {
    'type': 'map-reduce',
    'description': 'general aggregation per period',
    'mapReduce': function(collection) {
      return collection.mapReduce(
        function() {
          var period = this.year - this.year % 10;
          var value = {
            count: 1,
            total: parseInt(this.rating)
          };
          emit(period, value);
        },
        function(key, values) {
          var reducedVal = {
            count: 0,
            total: 0
          };
          for(var idx = 0; idx < values.length; idx++) {
            reducedVal.count += values[idx].count;
            reducedVal.total += values[idx].total;
          }
          return reducedVal;
        }, {
          query: {},
          out: 'periods',
          finalize: function(key, reducedVal) {
            reducedVal.avg = reducedVal.total / reducedVal.count;
            return reducedVal;
          }
        }
      );
    },
    'lists': {
      'best-periods': {
        'name': 'best period',
        'sort': '{"value.avg": -1 }'
      },
      'worst-periods': {
        'name': 'worst period',
        'sort': '{"value.avg": 1 }'
      },
      'watched-periods': {
        'name': 'most movies seens',
        'sort': '{"value.count": -1}'
      }
    }
  }
};


/**
 * return the agregation list info
 * @param {String} name
 * @return {Object}
 */
module.exports.getList = function(aggregationName, listName) {
  return aggregation[aggregationName] ? aggregation[aggregationName].lists[listName] : null;
};
