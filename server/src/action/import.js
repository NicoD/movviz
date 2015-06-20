/**
 * data import module
 * @module module/import
 */
'use strict';

var mongoose = require('mongoose'),
  fs = require('fs'),
  csv = require('fast-csv'),
  events = require('events'),
  util = require('util'),
  logger = require('../utils/logger').Logger,
  movieModelFactory = require('../model/movie.js');


/**
 * import movie from a source into a repository
 * @class
 * @param {string} userId
 * @param {string} filePath - path of the file
 * @param {Object} MovieModel 
 */
var ImportAction = function(userId, filePath, MovieModel) {


  var self = this;
  events.EventEmitter.call(this);

  /**
   * clean the raw result of the csv file
   *
   * @param {array} row result
   * @return {Object} cleaned result
   */
  var cleanRawResult = function(data) {
    /*jshint -W069 */
    var res = {
      user: mongoose.Types.ObjectId(userId),
      title: data['Title'],
      // the is a heuristic...we assume, we have watched the movie 
      // when the entry has been created
      watched_at: Date.parse(data['created']),
      genres: [],
      directors: [],
      rating: parseInt(data['You rated'], 10),
      runtime: data['Runtime (mins)'] ? parseInt(data['Runtime (mins)'], 10) : -1,
      year: parseInt(data['Year'], 10),
      imdb: {
        _id: data['const'],
        url: data['URL'],
        rating: data['IMDb Rating'] ? parseInt(data['IMDb Rating'], 10) : -1,
      },
      imported_at: Date.parse(data['created']),
    };
    var directors = data['Directors'].split(',');
    directors.forEach(function(director) {
      res.directors.push({
        name: director.trim()
      });
    });
    var genres = data['Genres'].split(/[\s,]+/);
    genres.forEach(function(genre) {
      res.genres.push({
        label: genre
      });
    });
    return res;
  };


  this.stats = {
    inserted: 0,
    updated: 0,
    ignored: 0,
    error: 0
  };

  /**
   * parse and store the content of the filePath into the repository
   *
   * @param {callback}
   */
  var store = function(cb) {
    logger.log('info', 'reading \'%s\' and storing results into local database', filePath);


    // the storage is a bit tricky because of the double async operations: read file and db insert.
    // it is not possible to know if the file parsing will finish before the last db insert,
    // so we're using both "end parsing" and "nb current db insert" flags to keep track
    // of the situation to launch the success callback either:
    //  - at the last db insert (if no db inserts are pending, and the file have already been fully parsed)
    //  - at the end of the parsing (if there is no db insert pending)
    var stream = fs.createReadStream(filePath),
      csvStream = require('fast-csv').parse({
        headers: true
      }),
      countInsertRunning = 0,
      countInsertTotal = 0,
      parsingFinished = false;

    /**
     * callback when a movie has been inserted in the database
     * @param {Object}
     * @param {Object}
     */
    var cbInsert = function(err, movie) {

      if(err && err.code === 11000) {
        // duplicate, so, only the provider section is updated
        movie.slug = movieModelFactory.getMovieSlug(movie);
        MovieModel.findOne({
          user: movie.user,
          slug: movie.slug
        }, function(err, existingMovie) {
          if(err) {
            return onDbJobFinished(err);
          }
          if(movie.imdb.rating != existingMovie.imdb.rating) { // only use case where an update is necessary
            MovieModel.update({
              user: movie.user,
              slug: movie.slug
            }, {
              "imdb.rating": movie.imdb.rating
            }, function(err, movie) {
              onDbJobFinished(err, movie, 'updated');
            });
          } else {
            onDbJobFinished(null, movie, 'ignored');
          }
        });
      } else if(err) {
        onDbJobFinished(err, movie);
      } else {
        onDbJobFinished(null, movie, 'inserted');
      }
    };

    /**
     * callback when a job concerning a movie is finished
     * @param {Object}
     * @param {Object}
     * @param {string}
     */
    var onDbJobFinished = function(err, movie, state) {
      if(err) {
        console.log(movie);
        self.stats.error++;
      } else {
        self.stats[state]++;
      }
      countInsertTotal++;
      // file has been parsed and it is was the last pending db insert: end of the operation
      if(--countInsertRunning === 0 && parsingFinished) {
        cb(null, countInsertTotal);
      }
    };


    csvStream.on('data', function(data) {
      countInsertRunning++;
      var movieToInsert = cleanRawResult(data);
      MovieModel.create(movieToInsert, function(err) {
        // I have to keep a copy of the object otherwise it will be lost if save failed...
        cbInsert(err, movieToInsert);
      });
    }).on('data-invalid', function(data) {
      logger.log('warn', 'invalid data \'%s\'', String(data));
    }).on('end', function() {
      logger.log('info', 'parsing done');
      // end of the parsing, and no pending db insert: end of the operation
      if(countInsertRunning === 0) {
        cb(null, countInsertTotal);
      }
      parsingFinished = true;
    });
    stream.pipe(csvStream);
  };


  /**
   * process the import
   */
  this.process = function(cb) {
    logger.log('info', 'importing from \'%s\'', filePath);
    store(function(err, total) {
      if(err) {
        return cb(err);
      }
      logger.log('info', 'total stored: ' + total);
      self.emit('process-done');
    });
  };
};


util.inherits(ImportAction, events.EventEmitter);


/** 
 * ImportAction factory
 * @param {string} userid
 * @param {string} filePath
 * @param {Object} MovieModel
 */
module.exports.create = function(userId, filePath, MovieModel) {
  return new ImportAction(userId, filePath, MovieModel);
};