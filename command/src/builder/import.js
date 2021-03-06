/**
 * command import action  builder
 * @module command/builder/import
 */
'use strict';

var fileUtil = require('../../../server/src/utils/file'),
    movieModelFactory = require('../../../server/src/model/movie'),
    actionFactory = require('../../../server/src/action/import');


/**
 * import action builder
 * @param {Object} conn - mongoose 
 * @param {Object} program - cmd line result
 * @param {callback}
 */
exports.create = function(conn, program, cb) {
  if(!program.source) {
    return cb("source not set");
  }
  if(!program.user) {
    return cb("user not set");
  }

  // @TODO check that the user exists in db
  fileUtil.prepare(program.source, function(err, uri) {
    if(err) {
      return cb(err);
    }
    cb(null, actionFactory.create(program.user, uri, movieModelFactory.create(conn)));
  });
};
