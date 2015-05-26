'use strict';

var express = require('express'),
  path = require('path'),
  bodyParser = require('body-parser'),
  cookieParser = require('cookie-parser'),
  paginationFactory = require('./lib/utils/pagination'),
  movieRepositoryFactory = require('./lib/repository/movie'),
  movieCriteriaRepositoryFactory = require('./lib/repository/movie/criteria'),
  mydb = require('./lib/db');

var app = express();

app.set('views', './views');
app.set('view engine', 'jade');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cookieParser());


////////////////////// STATIC & PARTIAL /////////////////////////

app.use('/public', express.static(path.join(__dirname, 'public')));
// only for dev purpose (sourceMap);
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// partial view may be rendered through jade
app.get('/partial/:name?', function(req, res) {
  res.render('partial/' + req.params.name);
});
// render partial diretly from assets
app.get('/\*partial\.html', function(req, res, next) {
  res.sendFile(__dirname + '/assets/javascript' + req.originalUrl);
});

/////////////////////////////////////////////////////////////////



app.get('/api/movies/:search/:page', function(req, res) {
  var definition = movieCriteriaRepositoryFactory.create().findByName('search');
  var criteria = {
    "$where": definition.getWhere([req.params.search, 1])
  };
  sendMovieList(req, res, criteria);
});

app.get('/api/movies/:page', function(req, res) {
  sendMovieList(req, res);
});


var sendMovieList = function(req, res, criteria) {

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
    var action = require('./lib/action/list').create(
      criteria,
      pagination,
      movieRepositoryFactory.create(db)
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
};

app.get('/api/movie/:id?', function(req, res) {
  mydb.connect(function(err, db) {
    if(err) {
      throw err;
    }
    var action = require('./lib/action/detail').create(req.params.id, movieRepositoryFactory.create(db));
    action.process(function(err, result) {
      res.send(result);
    });
  });
});


// support HTML5Mode
app.get('/*', function(req, res) {
  res.render('index');
});
app.listen(80);