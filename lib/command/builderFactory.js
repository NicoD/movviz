/**
 * command action builder factory
 * @module command/builderFactory
 */
'use strict';

exports.create = function(name) {
  var moduleName = './builder/' + name;
  return require(moduleName);
};