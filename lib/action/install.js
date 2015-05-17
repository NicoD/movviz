/**
 * installation module
 * @module action/install
 */
'use strict';

var events = require('events'),
  util = require('util'),
  logger = require('../utils/logger').Logger,


  /**
   * Installation class
   * @class
   * @param {module:entity/MovieRepository} repository
   */
  InstallAction = function(repository) {

    var self = this;
    events.EventEmitter.call(this);

    /**
     * process the action
     */
    this.process = function() {
      logger.log('info', 'start installation');
      repository.install(function(err) {
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
 * @param {module:entity/MovieRepository} repository
 */
module.exports.create = function(repository) {
  return new InstallAction(repository);
};