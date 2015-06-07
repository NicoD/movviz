/**
 * command install action  builder
 * @module command/builder/install
 */
'use strict';

var movieRepFactory = require('../../../server/src/repository/movie'),
    customlistRepFactory = require('../../../server/src/repository/customlist'),
  actionFactory = require('../../../server/src/action/install');

/**
 * Callback used when the action is build
 * @callback module:command/builder/install~onBuild
 * @param {string} error
 * @param {Object} action
 */

/**
 * list action builder
 * @param {Object} db - database connection
 * @param {Object} program - cmd line result
 * @param {module:command/builder/list~onBuild} onBuild
 */
exports.create = function(db, program, onBuild) {
  var repositories = [],
    modules = [];
  if(program.modules) {
    modules = program.modules.split(',');
  }
  if(modules.indexOf('movie') != -1) {
    repositories.push(movieRepFactory.create(db));
  }
  if(modules.indexOf('customlist') != -1) {
    repositories.push(customlistRepFactory.create(db));
  }
  onBuild(null, actionFactory.create(repositories));
};
