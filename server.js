'use strict';

var express = require('express'),
    path = require('path'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    paginationFactory = require('./lib/utils/pagination'),
    movieRepositoryFactory = require('./lib/repository/movie'),
    mydb = require('./lib/db');

var app = express();

app.set('views', './views');
app.set('view engine', 'jade');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/public', express.static(path.join(__dirname, 'public')));
// only for dev purpose (sourceMap);
app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get('/', function(req, res) {
  res.render('index');
});


app.get('/api/movies/:page?', function(req, res) {
  mydb.connect(function(err, db) {
    if(err) { throw err; }
   
    var resultPerPage = 50;
    var page = req.params.page ? parseInt(req.params.page) : 0;

    var pagination = paginationFactory.create(req.params.page ? parseInt(req.params.page, 10) : 0, 50);
    var results = {
      pagination: pagination,
      movies: []
    };
    var action = require('./lib/action/list').create(
                  {}, 
                  pagination,
                  movieRepositoryFactory.create(db)
                );
    action.on('process-done', function() {
      res.send(results);
    });

    var movies = results.movies;
    action.process(function(err, iterator) {
      var iterate = function(err, obj) {
        if(!obj) { return; }
        movies.push(obj);
        iterator.next(iterate);
      };
      iterator.next(iterate);
    });
  });
});

app.listen(80);
