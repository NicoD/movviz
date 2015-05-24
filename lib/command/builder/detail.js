/**
 * command detail action builder
 * @module command/builder/detail
 */
'use strict';

var movieRepositoryFactory = require('../../repository/movie'),
  actionFactory = require('../../action/detail');


/**
 * Callback used when the action is build
 * @callback module:command/builder/detail~onBuild
 * @param {string} error
 * @param {Object} action
 */

/**
 * detail action builder
 * @param {Object} db - database connection
 * @param {Object} program - cmd line result
 * @param {module:command/builder/detail~onBuild} onBuild
 */
exports.create = function(db, program, onBuild) {
  var id = program.movieid || 0;
  if(!id) {
    return onBuild("movieid not set");
  }
  var action = actionFactory.create(id, movieRepositoryFactory.create(db));

  // create a proxy of the process command to display the result
  action._process = action.process;
  action.process = function() {
    action._process(function(err, result) {
      if(err) {
        return onBuild(err);
      }

      if(!result) {
        process.stdout.write('no result');
      } else {
        process.stdout.write(JSON.stringify(result, null, 2));
      }
      process.stdout.write("\n");
    });
  };

  onBuild(null, action);
};