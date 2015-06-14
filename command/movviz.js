'use strict';

try {
  // loader the router that will build the action according to the command line
  var router = require('./src/router').create(process.argv),
    logger = require('../server/src/utils/logger').Logger;

  router.get(function(err, action) {
    if(err) {
      logger.log('error', String(err));
      throw err;
    }
    action.on('error', function(err) {
      logger.log('error', String(err));
      throw err;
    });

    action.process();
  });


} catch(e) {
  console.log(String(e));
  console.trace();
}
