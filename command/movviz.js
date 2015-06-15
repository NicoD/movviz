'use strict';

try {
  // loader the router that will build the action according to the command line
  var router = require('./src/router').create(process.argv),
      logger = require('../server/src/utils/logger').Logger;

  router.get(function(err, action) {
    if(err) {
      return handleError(err);
    }
    action.process(handleError);
  });

} catch(e) {
  handleError(e);
}


function handleError(e) {
  if(!e) { return; }
  logger.log('error', String(e));
  console.log(String(e));
  console.trace();
}
