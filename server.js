'use strict';

var express = require('express'),
  path = require('path'),
  bodyParser = require('body-parser'),
  cookieParser = require('cookie-parser'),
  paginationFactory = require('./lib/utils/pagination'),
  movieRepFactory = require('./lib/repository/movie'),
  movieCriteriaRepFactory = require('./lib/repository/movie/criteria'),
  customlistRepFactory = require('./lib/repository/customlist'),
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
  var definition = movieCriteriaRepFactory.create().findByName('search');
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
};

app.get('/api/movie/:id?', function(req, res) {
  mydb.connect(function(err, db) {
    if(err) {
      throw err;
    }
    // @TODO direct call
    var action = require('./lib/action/detail').create(req.params.id, movieRepFactory.create(db));
    action.process(function(err, result) {
      res.send(result);
    });
  });
});

var setCustomlistResult = function(movieRep, customlist, pagination, onFilled) {
  customlist.list = {
    pagination: pagination,
    results: []
  };
  movieRep.getAggregatedResults(customlist, pagination, function(err, aggResults) {
    if(err) { return onFilled(err); }
    aggResults.toArray(function(err, arr) {
      if(err) { return onFilled(err); }
      customlist.list.results = arr;
      onFilled();
    });
  });
};


app.get('/api/customlist/:slug/:page', function(req, res) {
  mydb.connect(function(err, db) {
    if(err) { throw err; }
    var resultsPerPage = 15;
    var pagination = paginationFactory.create(req.params.page ? parseInt(req.params.page, 10) : 0, resultsPerPage);
    var movieRep = movieRepFactory.create(db);
    var customlistRep = customlistRepFactory.create(db);
    customlistRep.getBySlug(req.params.slug, function(err, result) {
      if(err) { throw err; }
      setCustomlistResult(movieRep, result, pagination, function(err) {
        if(err) { throw err; }
        res.send(result);
      });
    });
  });
});

app.get('/api/customlists/results', function(req, res) {
  mydb.connect(function(err, db) {
    if(err) {
      throw err;
    }
    
    var action = require('./lib/action/list').create({}, {}, customlistRepFactory.create(db));
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
          if(err) { throw err; }
          iterator.next(iterate);
        });
      };
      iterator.next(iterate);
    });
  });

});


// support HTML5Mode
app.get('/*', function(req, res) {
  res.render('index');
});
app.listen(80);
