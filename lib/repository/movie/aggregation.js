'use strict';

/* global emit */

var aggregation = [
  {
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
          out: "directors",
          finalize: function(key, reducedVal) {
            reducedVal.avg = reducedVal.total / reducedVal.count;
            return reducedVal;
          }
        }
      );
    },

    'lists': [
      {
        'name': 'best directors',
        'sort': '{"value.avg": -1 }'
      },
      {
        'name': 'worst directors',
        'sort': '{"value.avg": 1 }'
      },
      {
        'name': 'most movies seens',
        'sort': '{"value.count": -1}'
      }
    ]
  },

  {
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

    'lists': [
      {
        'name': 'best period',
        'sort': '{"value.avg": -1 }'
      },
      {
        'name': 'worst period',
        'sort': '{"value.avg": 1 }'
      },
      {
        'name': 'most movies seens',
        'sort': '{"value.count": -1}'
      }
    ]


  }
];