/**
 * command install action builder
 * @module command/builder/install
 */
'use strict';

var customlistModelFactory = require('../../../server/src/model/customlist'),
    logger = require('../../../server/src/utils/logger').Logger,
    events = require('events'),
    util = require('util'),
    async = require('async');


/**
 * Installation class
 * @class
 * @param {Array} installfcts
 */
var InstallAction = function(conn, installfcts) {
  var self = this;
  events.EventEmitter.call(this);

  this.process = function() {
    logger.log('info', 'start installation');
    async.each(installfcts, function(installfct, callback) {
      installfct(conn, callback);
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
 * list action builder
 * @param {Object} conn
 * @param {Object} program - cmd line result
 * @param {callback}
 */
exports.create = function(conn, program, cb) {
  var installfcts = [],
      modules = [];
  if(program.modules) {
    modules = program.modules.split(',');
  }
  if(modules.indexOf('customlist') != -1) {
    installfcts.push(customlistModelFactory.install);
  }
  cb(null, new InstallAction(conn, installfcts));
};
