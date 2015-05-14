/**
 * data reader module
 * @module import/importer
 */
'use strict';

var fs = require('fs'),
  csv = require('fast-csv'),
  readline = require('readline'),
  logger = require('../utils/logger').Logger,


  /**
   * Importer is used to import data from a source into a repository
   * @class
   * @param {module:import/reader~Reader} reader source
   * @param {module:entity/MovieRepository} repository
   * @param {module:import/importer~Importer~onDispose} onDispose - cb when the importer is disposed to force free some resources
   */
  Importer = function(sourceReader, repository, onDispose) {

    /**
     * Callback used when the importer dispose
     * @callback module:import/importer~Importer~onDispose
     */

    /**
     * Callback used when the process is done
     * @callback module:import/importer~Importer~onProcessed
     * @param {string} err
     */

    /**
     * Callback used when data all all stored
     * @callback module:import/importer~Importer~onStored
     * @param {Number} total stored
     */


    /**
     * clean the raw result of the csv file
     *
     * @param {array} row result
     * @return {Object} cleaned result
     */
    var cleanRawResult = function(data) {
      var res, directors;
      res = {
        'createAt': Date.parse(data[2]),
        'title': data[5],
        'genre': data[12].split(/[\s,]+/),
        'directors': [],
        'rating': data[8],
        'runtime': data[10],
        'year': data[11],
        'imdb': {
          'id': data[1],
          'url': data[15],
          'rating': data[9]
        }
      };
      directors = data[7].split(',');
      directors.forEach(function(elem) {
        res.directors.push({
          'name': elem
        });
      });
      return res;
    };


    /**
     * parse and store the content of the filePath into the repository
     *
     * @param {string} input file path
     * @param {module:import/importer~Importer~onStored}
     */
    var store = function(filePath, onStored) {
      logger.log('info', 'reading \'%s\' and storing results into local database', filePath);


      // the storage is a bit tricky because of the double async operations: read file and db insert.
      // it is not possible to know if the file parsing will finish before the last db insert,
      // so we're using both "end parsing" and "nb current db insert" flags to keep track
      // of the situation to launch the success callback either:
      //  - at the last db insert (if no db inserts are pending, and the file have already been fully parsed)
      //  - at the end of the parsing (if there is no db insert pending)
      var stream = fs.createReadStream(filePath),
        csvStream = require('fast-csv').parse(),
        countInsertRunning = 0,
        countInsertTotal = 0,
        parsingFinished = false,
        onInsert = function() {
          countInsertTotal++;
          // file has been parsed and it is was the last pending db insert: end of the operation
          if(--countInsertRunning === 0 && parsingFinished) {
            onStored(countInsertTotal);
          }
        };
      csvStream.on('data', function(data) {
        countInsertRunning++;
        repository.store(cleanRawResult(data), onInsert);
      }).on('data-invalid', function(data) {
        logger.log('warn', 'invalid data \'%s\'', String(data));
      }).on('end', function() {
        logger.log('info', 'parsing done');
        // end of the parsing, and no pending db insert: end of the operation
        if(countInsertRunning === 0) {
          onStored(countInsertTotal);
        }
        parsingFinished = true;
      });
      stream.pipe(csvStream);
    };


    /**
     * process the import
     * @param {module:import/importer~Importer~onProcessed} 
     */
    this.process = function(onProcessed) {
      logger.log('info', 'importing from \'%s\'', sourceReader.getSourceInfo());
      sourceReader.prepare(function(err, filePath) {
        if(err) {
          return onProcessed(err);
        }
        store(filePath, function(total) {
          logger.log('info', 'total stored: ' + total);
          onProcessed();
        });
      });
    };

    /**
     * method to call when disposing the importer
     */
    this.dispose = function() {
      onDispose && onDispose(); // jshint ignore:line
    };
  };


/** 
 * Importer factory
 * @param {module:import/reader~Reader} reader source
 * @param {module:entity/MovieRepository} repository
 * @param {module:import/importer~onDispose} onDispose - when the importer is done
 */
module.exports.create = function(sourceReader, repository, onDispose) {
  return new Importer(sourceReader, repository, onDispose);
};