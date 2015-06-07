/**
 * command import action  builder
 * @module command/builder/import
 */
'use strict';

var fileUtil = require('../../../server/src/utils/file'),
  movieRepositoryFactory = require('../../../server/src/repository/movie'),
  actionFactory = require('../../../server/src/action/import');


/**
 * Callback used when the action is build
 * @callback module:command/builder/import~onBuild
 * @param {string} error
 * @param {Object} action
 */

/**
 * import action builder
 * @param {Object} db - database connection
 * @param {Object} program - cmd line result
 * @param {module:command/builder/import~onBuild} onBuild
 */
exports.create = function(db, program, onBuild) {
  if(!program.source) {
    return onBuild("source not set");
  }

  fileUtil.prepare(program.source, function(err, uri) {
    if(err) {
      onBuild(err);
    }
    onBuild(null, actionFactory.create(uri, movieRepositoryFactory.create(db)));
  });
};
