'use strict';

var customlistModelFactory = require('../model/customlist'),
  movieModelFactory = require('../model/movie'),
  mydb = require('../db'),
  paginationFactory = require('../utils/pagination');

module.exports = function(app) {

  /**
   * custom list API
   */
  app.get('/api/customlist/:slug/:page', function(req, res) {
    mydb.connect(function(err, conn) {
      if(err) {
        throw err;
      }
      var resultsPerPage = 15;
      var pagination = paginationFactory.create(req.params.page ? parseInt(req.params.page, 10) : 0, resultsPerPage);
      var MovieModel = movieModelFactory.create(conn);
      var CustomlistModel = customlistModelFactory.create(conn);
      CustomlistModel.findBySlug(req.params.slug).lean().exec(function(err, customlist) {
        if(err) {
          throw err;
        }
        setCustomlistResult(MovieModel, customlist, pagination, function(err) {
          if(err) {
            throw err;
          }
          res.send(customlist);
        });
      });
    });
  });


  /**
   * custom lists full result API
   */
  app.get('/api/customlists/results', function(req, res) {
    mydb.connect(function(err, conn) {
      if(err) {
        throw err;
      }

      // pagination concern ONLY the results, not pagination is supported for the lists (too few)
      // when getting ALL the results, only first page is supports
      var resultsPerPage = 15;
      var MovieModel = movieModelFactory.create(conn);
      var CustomlistModel = customlistModelFactory.create(conn);
      var results = [];

      CustomlistModel.findWithPagination({}, {}, function(err, customlistRes) {
        var stream = customlistRes.lean().stream();
        stream.on('data', function(customlist) {
          var self = this;
          var pagination = paginationFactory.create(0, resultsPerPage);
          results.push(customlist);
          this.pause();
          setCustomlistResult(MovieModel, customlist, pagination, function(err) {
            if(err) {
              throw err;
            }
            self.resume();
          });
        }).on('error', function(err) {
          throw err;
        }).on('close', function() {
          res.send(results);
        });
      });
    });
  });


  /**
   * helper method that apply cutomlist results to a custom list
   * @param {Object} MovieaModel
   * @param {Object} customlist
   * @param {Object} pagination
   * @param {callback}
   */
  function setCustomlistResult(MovieModel, customlist, pagination, cb) {
    customlist.list = {
      pagination: pagination,
      results: []
    };
    MovieModel.getAggregatedResults(customlist, pagination, function(err, aggResults) {
      if(err) {
        return cb(err);
      }
      aggResults.exec(function(err, arr) {
        if(err) {
          return cb(err);
        }
        customlist.list.results = arr;
        cb();
      });
    });
  }
};