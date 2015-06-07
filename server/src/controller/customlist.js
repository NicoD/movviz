'use strict';

var customlistRepFactory = require('../repository/customlist'),
  movieRepFactory = require('../repository/movie'),
  mydb = require('../db'),
  paginationFactory = require('../utils/pagination'),
  listAction = require('../action/list');

module.exports = function(app) {

  /**
   * custom list API
   */
  app.get('/api/customlist/:slug/:page', function(req, res) {
    mydb.connect(function(err, db) {
      if(err) {
        throw err;
      }
      var resultsPerPage = 15;
      var pagination = paginationFactory.create(req.params.page ? parseInt(req.params.page, 10) : 0, resultsPerPage);
      var movieRep = movieRepFactory.create(db);
      var customlistRep = customlistRepFactory.create(db);
      customlistRep.getBySlug(req.params.slug, function(err, result) {
        if(err) {
          throw err;
        }
        setCustomlistResult(movieRep, result, pagination, function(err) {
          if(err) {
            throw err;
          }
          res.send(result);
        });
      });
    });
  });


  /**
   * custom lists full result API
   */
  app.get('/api/customlists/results', function(req, res) {
    mydb.connect(function(err, db) {
      if(err) {
        throw err;
      }
      var action = listAction.create({}, {}, customlistRepFactory.create(db));
      action.on('process-done', function() {
        res.send(results);
      });

      // pagination concern ONLY the results, not pagination is supported for the lists (too few)
      // when getting ALL the results, only first page is supports
      var resultsPerPage = 15;
      var movieRep = movieRepFactory.create(db);
      var results = [];
      action.process(function(err, iterator) {
        var iterate = function(err, obj) {
          if(!obj) {
            return;
          }
          var pagination = paginationFactory.create(0, resultsPerPage);
          results.push(obj);
          obj.list = {
            pagination: pagination,
            results: []
          };
          setCustomlistResult(movieRep, obj, pagination, function(err) {
            if(err) {
              throw err;
            }
            iterator.next(iterate);
          });
        };
        iterator.next(iterate);
      });
    });
  });


  /**
   * helper method that apply cutomlist results to a custom list
   * @param {Object} movieRep
   * @param {Object} customlist
   * @param {Object} pagination
   * @param {Callback} onFilled
   */
  function setCustomlistResult(movieRep, customlist, pagination, onFilled) {
    customlist.list = {
      pagination: pagination,
      results: []
    };
    movieRep.getAggregatedResults(customlist, pagination, function(err, aggResults) {
      if(err) {
        return onFilled(err);
      }
      aggResults.toArray(function(err, arr) {
        if(err) {
          return onFilled(err);
        }
        customlist.list.results = arr;
        onFilled();
      });
    });
  }
};