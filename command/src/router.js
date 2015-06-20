/**
 * Routing from args module
 * @module command/router
 */
'use strict';


var mydb = require('../../server/src/db'),
    Command = require('commander').Command,
    actionBuilderFactory = require('./builderFactory'),
    logger = require('../../server/src/utils/logger').Logger;


/**
 * CommandRouter is used to build an action according to the command line args
 * @class
 * @param {Array} argv - Args of the process (process.argv)
 */
var CommandRouter = function(argv) {

  var program = new Command();

  // command line form description
  program.version('1.0.0')
    .description('import a list')
    .option('-c, --cmd [cmd]', 'Command', /^(import|list|install)$/i)
    .option('-s, --source [source]', 'source (url or path) [import]}')
    .option('-v, --verbose', 'verbose mode')
    .option('--user', 'user id [import[install]')
    .option('-l, --lines [value]', 'Line number to display per page [list]', parseInt)
    .option('--criteria [value]', 'search criteria [list]')
    .option('--modules [value]', 'comma separated modules  [install]');

  // command line help callback
  program.on('--help', function() {
    console.log('  Examples:');
    console.log('');
    console.log('    $ nodejs movviz.js --cmd=import --source=/tmp/file.csv --user=584123654785211');
    console.log('    $ nodejs movviz.js --cmd=list -v');
    console.log('    $ nodejs movviz.js --cmd=install --modules=customlist');
    console.log('    $ nodejs movviz.js --cmd list -v -l 1000 --criteria search');
    console.log('');
  });

  program.parse(argv);


  /**
   * Do the routing and generate the acion coreesponding to the given args.
   * @param {callback}
   */
  this.get = function(cb) {

    // initialize the verbose mode
    logger.level = program.verbose ? 'info' : 'error';
    logger.log('info', 'running command %s', program.cmd);

    mydb.connect(function(err, conn) {
      if(err) {
        return cb(err);
      }
      logger.log('info', 'connection to database');

      actionBuilderFactory
          .create(program.cmd)
          .create(conn, program,
            function(err, action) {
              if(err) { return cb(err); }
              action.on('process-done', function() {
                conn.close();
              });
              action.on('error', function(err) {
                conn.close();
                cb(err);
              });
              cb(null, action);
            });
    });
  };
};


/** 
 * CommandRouter factory
 * @param {Array} argv - Args of the process (process.argv)
 * @return {Object}
 */
module.exports.create = function(argv) {
  return new CommandRouter(argv);
};
