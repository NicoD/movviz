'use strict';


var movieCriteriaRepFactory = require('../repository/movie/criteria'),
  movieRepFactory = require('../repository/movie'),
  mydb = require('../db'),
  paginationFactory = require('../utils/pagination'),
  listAction = require('../action/list');

module.exports = function(app) {

  /**
   * search movies result API
   */
  app.get('/api/movies/:search/:page', function(req, res) {
    var definition = movieCriteriaRepFactory.create().findByName('search');
    var criteria = {
      "$where": definition.getWhere([req.params.search, 1])
    };
    sendMovieList(req, res, criteria);
  });


  /**
   * list movies API
   */
  app.get('/api/movies/:page', function(req, res) {
    sendMovieList(req, res);
  });


  /**
   * movie detail API
   */
  app.get('/api/movie/:id?', function(req, res) {
    mydb.connect(function(err, db) {
      if(err) {
        throw err;
      }
      movieRepFactory.create(db).getById(req.params.id, function(err, result) {
        if(err) {
          throw err;
        }
        res.send(result);
      });
    });
  });


  /**
   * helper method that ouput the result of a simple find with the given criteria
   * @param {Object} req
   * @param {Object} res
   * @param {Object} criteria
   */
  function sendMovieList(req, res, criteria) {

    mydb.connect(function(err, db) {
      if(err) {
        throw err;
      }
      var resultsPerPage = 50;
      var pagination = paginationFactory.create(req.params.page ? parseInt(req.params.page, 10) : 0, resultsPerPage);
      var results = {
        pagination: pagination,
        movies: []
      };
      var action = listAction.create(
        criteria,
        pagination,
        movieRepFactory.create(db)
      );
      action.on('process-done', function() {
        res.send(results);
      });

      var movies = results.movies;
      action.process(function(err, iterator) {
        var iterate = function(err, obj) {
          if(!obj) {
            return;
          }
          movies.push(obj);
          iterator.next(iterate);
        };
        iterator.next(iterate);
      });
    });
  }

};