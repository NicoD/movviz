'use strict';

var express = require('express'),
    path = require('path'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),

    movieRepositoryFactory = require('./lib/repository/movie'),
    mydb = require('./mydb');

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


app.get('/movies', function(req, res) {
  mydb.connect(function(err, db) {
    if(err) { throw err; }
    
    var movies = [];
    var action = require('./lib/action/list').create({}, movieRepositoryFactory.create(db));
    action.on('process-done', function() {
      res.send(movies);
    });


    var iterator = action.process();
    var iterate = function(err, obj) {
      if(!obj) { return; }
      movies.push(obj);
      iterator.next(iterate);
    };
    iterator.next(iterate);
  });
});

app.listen(80);
