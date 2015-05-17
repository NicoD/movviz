/**
 * data listing module
 * @module action/list
 */
'use strict';

var events = require('events'),
  util = require('util'),
  logger = require('../utils/logger').Logger,


  /**
   * List is used to ... to list the movies
   * @class
   * @param {Object} criteria
   * @param {module:entity/irepository} repository
   */
  ListAction = function(criteria, repository) {

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
      logger.log('info', 'listing movies' + (criteria ? ' using criteria ' + JSON.stringify(criteria) : ''));
      return new ResultIterator(
        repository.find(criteria),
        function() {
          self.emit('process-done');
        });
    };
  };


util.inherits(ListAction, events.EventEmitter);


/** 
 * Lister factory
 * @param {Object} criteria - search criteria (JSON)
 * @param {module:entity/MovieRepository} repository
 * @return {module:action/list~ListAction}
 */
module.exports.create = function(criteria, repository) {
  return new ListAction(criteria, repository);
};