'use strict';

try {
  // loader the router that will build the action according to the command line
  var router = require('./lib/command/router').create(process.argv),
    logger = require('./lib/utils/logger').Logger;

  router.get(function(err, action) {
    if(err) {
      logger.log('error', String(err));
      return;
    }
    action.on('error', function(err) {
      logger.log('error', String(err));
    });

    action.process();
  });


} catch(e) {

  console.log(String(e));
  console.trace();
}