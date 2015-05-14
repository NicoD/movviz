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

  // CommandError also flush the command usage
  // this separator is used to get the error trace still lisible
  if(e instanceof router.CommandError) {
    console.log("\n--------------------------------");
  }
  console.log(String(e));
  console.trace();
}