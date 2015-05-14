/**
 * data reader module
 * @module import/lister
 */
'use strict';

var events = require('events'),
  util = require('util'),
  logger = require('../utils/logger').Logger,


  /**
   * List is used to ... to list the movies
   * @class
   * @param {module:entity/Repository} repository
   */
  Lister = function(repository) {



    /**
     * iterator class used to be able to call a callback
     * at the end of the iteration.
     * kind of proxy of the mongoDb cursor
     * /!\ the iteration is asynchronous :'(
     * @param {Object} mongoDb cursor
     * @param {callback} call for each results
     */
    var ResultIterator = function(dbCursor, onEnd) {

      this.next = function(callback) {
        dbCursor.nextObject(function(err, object) {
          if(object === null) {
            onEnd();
          }
          callback(err, object);
        });
      };
    };

    var self = this;
    events.EventEmitter.call(this);

    /**
     * process the import
     */
    this.process = function() {
      self.emit('process-start');
      logger.log('info', 'listing movies');
      return new ResultIterator(
        repository.find(),
        function() {
          self.emit('process-done');
        });
    };
  };


util.inherits(Lister, events.EventEmitter);


/** 
 * Lister factory
 * @param {module:entity/MovieRepository} repository
 */
module.exports.create = function(repository) {
  return new Lister(repository);
};