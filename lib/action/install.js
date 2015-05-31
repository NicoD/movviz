/**
 * installation module
 * @module action/install
 */
'use strict';

var events = require('events'),
  util = require('util'),
  async = require('async'),
  logger = require('../utils/logger').Logger,


  /**
   * Installation class
   * @class
   * @param {Array} repositories
   */
  InstallAction = function(repositories) {

    var self = this;
    events.EventEmitter.call(this);

    /**
     * process the action
     */
    this.process = function() {
      logger.log('info', 'start installation');
      async.each(repositories, function(repository, callback) {
        repository.install(callback);
      }, function(err) {
        if(err)
          return self.emit('error', err);
        logger.log('info', 'installation done');
        self.emit('process-done');
      });
    };
  };


util.inherits(InstallAction, events.EventEmitter);


/** 
 * InstallAction factory
 * @param {Array} 
 */
module.exports.create = function(repositories) {
  return new InstallAction(repositories);
};
