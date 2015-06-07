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
   * @param {module:utils/pagination~Pagination} pagination
   * @param {module:entity/repository} repository
   */
  ListAction = function(criteria, pagination, repository) {

    /**
     * Callback used when the process is ready
     * @callback module:action/list~ListAction~onReady
     * @param {string} error
     * @param {Object} resultIterator
     */


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
            return onEnd();
          }
          callback(err, object);
        });
      };
    };

    var self = this;
    events.EventEmitter.call(this);

    /**
     * process the import
     * @param {module:action/list~ListAction~onReady}
     */
    this.process = function(onReady) {
      self.emit('process-start');
      logger.log('info', 'listing movies' + (criteria ? ' using criteria ' + JSON.stringify(criteria) : ''));
      repository.find(criteria, pagination, function(err, results) {
        if(err) {
          return onReady(err);
        }
        onReady(null, new ResultIterator(
          results,
          function() {
            self.emit('process-done');
          }
        ));
      });
    };
  };


util.inherits(ListAction, events.EventEmitter);


/** 
 * Lister factory
 * @param {Object} criteria - search criteria (JSON)
 * @param {module:utils/pagination~Pagination} pagination - pagination info
 * @param {module:entity/MovieRepository} repository
 * @return {module:action/list~ListAction}
 */
module.exports.create = function(criteria, pagination, repository) {
  return new ListAction(criteria, pagination, repository);
};