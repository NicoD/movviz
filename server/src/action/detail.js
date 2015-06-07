/**
 * data detail module
 * @module action/detail
 */
'use strict';

var events = require('events'),
  util = require('util'),
  logger = require('../utils/logger').Logger,


  /**
   * Detail is used to ... to get the detail of a movies
   * @class
   * @param {String} id
   * @param {module:entity/repository} repository
   */
  DetailAction = function(id, repository) {

    /**
     * Callback used when the process is ready
     * @callback module:action/detail~DetailAction~onReady
     * @param {string} error
     * @param {Object} result
     */


    var self = this;
    events.EventEmitter.call(this);

    /**
     * process the import
     * @param {module:action/detail~DetailAction~onReady}
     */
    this.process = function(onReady) {
      self.emit('process-start');
      logger.log('info', 'search detail from movie ' + id);
      var result = repository.getById(id, function(err, item) {
        if(err) {
          return onReady(err);
        }

        onReady(null, item);
        self.emit('process-done');
      });
    };
  };

util.inherits(DetailAction, events.EventEmitter);


/** 
 * Detail factory
 * @param {String} id - movie id
 * @param {module:entity/MovieRepository} repository
 * @return {module:action/detail~DetailAction}
 */
module.exports.create = function(id, repository) {
  return new DetailAction(id, repository);
};