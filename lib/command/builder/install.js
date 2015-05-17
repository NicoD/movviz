/**
 * command install action  builder
 * @module command/builder/install
 */
'use strict';

var movieRepositoryFactory = require('../../repository/movie'),
  actionFactory = require('../../action/install');

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
  onBuild(null, actionFactory.create(movieRepositoryFactory.create(db)));
};