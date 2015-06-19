'use strict';


var movieCriteriaModelFactory = require('../model/movie/criteria'),
  movieModelFactory = require('../model/movie'),
  mydb = require('../db'),
  paginationFactory = require('../utils/pagination'),
  authMiddleware = require('../middleware/auth'),
  multipartyMiddleware = require('connect-multiparty')();



module.exports = function(app) {


  /**
   * upload of the list
   */
  app.post('/api/import', authMiddleware, multipartyMiddleware, function(req, res) {
    var file = req.files.file;
    console.log(file.name);
    console.log(file.type);

  });


  /**
   * search movies result API
   */
  app.get('/api/movies/:search/:page', function(req, res) {
    var definition = movieCriteriaModelFactory.create()
      .findByName('search');
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
    mydb.connect(function(err, conn) {
      if(err) {
        throw err;
      }
      movieModelFactory.create(conn).findById(req.params.id, function(err, result) {
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
    mydb.connect(function(err, conn) {
      if(err) {
        throw err;
      }
      var resultsPerPage = 50;
      var pagination = paginationFactory.create(req.params.page ? parseInt(req.params.page, 10) : 0, resultsPerPage);
      var results = {
        pagination: pagination,
        movies: []
      };
      movieModelFactory.create(conn).findWithPagination(criteria, pagination, function(err, movieRes) {
        var movies = results.movies;
        var stream = movieRes.stream();
        stream.on('data', function(movie) {
          movies.push(movie);
        }).on('error', function(err) {
          throw err;
        }).on('close', function() {
          res.send(results);
        });
      });
    });
  }

};