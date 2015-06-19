/**
 * data import module
 * @module module/import
 */
'use strict';

var fs = require('fs'),
  csv = require('fast-csv'),
  events = require('events'),
  util = require('util'),
  logger = require('../utils/logger').Logger,


  /**
   * import movie from a source into a repository
   * @class
   * @param {string} filePath - path of the file
   * @param {Object} MovieModel 
   */
  ImportAction = function(filePath, MovieModel) {


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
        title: data['Title'],
        watched_at: Date.parse(data['created']),
        genres: [],
        directors: [],
        rating: parseInt(data['You rated'], 10),
        runtime: parseInt(data['Runtime (mins)'], 10),
        year: parseInt(data['Year'], 10),
        imdb: {
          _id: data['const'],
          url: data['URL'],
          rating: parseInt(data['IMDb Rating'], 10),
        }
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
        parsingFinished = false,
        cbInsert = function(err) {
          if(err) {} // ignore err

          countInsertTotal++;
          // file has been parsed and it is was the last pending db insert: end of the operation
          if(--countInsertRunning === 0 && parsingFinished) {
            cb(null, countInsertTotal);
          }
        };
      csvStream.on('data', function(data) {
        countInsertRunning++;
        new MovieModel(cleanRawResult(data)).save(cbInsert);
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
 * @param {string} filePath
 * @param {Object} MovieModel
 */
module.exports.create = function(filePath, MovieModel) {
  return new ImportAction(filePath, MovieModel);
};
