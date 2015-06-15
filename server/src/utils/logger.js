/**
 * Logger module that enhance winston
 * @module utils/logger
 */
'use strict';


/**
 * Logger class
 * basically a proxy of winston module
 * @class
 */
var Logger = function() {
  var logger = require('winston');

  /**
   * set the level
   * @param {string} level 
   */
  this.__defineSetter__('level', function(arg) {
    logger.level = arg;
  });

  /**
   * get the level
   * @return {string}
   */
  this.__defineGetter__('level', function() {
    return logger.level;
  });

  /**
   * log a message 
   * @see module:winston
   */
  this.log = function() {
    logger.log.apply(this, Array.prototype.slice.call(arguments));
  };
};


/** 
 * Logger object 
 * @type {Object}
 */
exports.Logger = new Logger();