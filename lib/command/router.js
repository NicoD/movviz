/**
 * Routing from args module
 * @module command/router
 */
'use strict';


var MongoClient = require('mongodb').MongoClient,
  Command = require('commander').Command,
  util = require('util'),
  actionBuilderFactory = require('./builderFactory'),
  logger = require('../utils/logger').Logger;


/**
 * CommandRouter is used to build an action according to the command line args
 * @class
 * @param {array} argv - Args of the process (process.argv)
 */
var CommandRouter = function(argv) {

  /**
   * Callback used when getting a action
   * @callback module:command/router~CommandRouter~onGet
   * @param {string} error
   * @param {Object} action object
   */

  var program = new Command();

  // command line form description
  program.version('1.0.0')
    .description('import a list')
    .option('-c, --cmd [cmd]', 'Command', /^(import|list|install)$/i)
    .option('-s, --source [source]', 'source (url or path) [import]}')
    .option('-v, --verbose', 'verbose mode')
    .option('-l, --lines [value]', 'Line number to display per page [list]', parseInt)
    .option('--criteria [value]', 'search criteria [list]');

  // command line help callback
  program.on('--help', function() {
    console.log('  Examples:');
    console.log('');
    console.log('    $ node movies.js --cmd=import --source=/tmp/file.csv');
    console.log('');
  });

  program.parse(argv);


  /**
   * Do the routing and generate the acion coreesponding to the given args.
   * @param {module:command/router~CommandRouter~onGet} onGet
   */
  this.get = function(onGet) {

    // initialize the verbose mode
    logger.level = program.verbose ? 'info' : 'error';
    logger.log('info', 'running command %s', program.cmd);


    // @TODO, for the moment, the db is always mandatory and hardcoded:
    MongoClient.connect('mongodb://localhost:27017/movviz', function(err, db) {
      if(err) {
        return onGet(err);
      }
      logger.log('info', 'connection to database');

      try {
        actionBuilderFactory.create(program.cmd)
          .create(db, program,
            function(err, action) {
              if(!err) {
                action.on('process-done', function() {
                  db.close();
                });
                action.on('error', function() {
                  db.close();
                });
              }
              onGet(err, action);
            });

      } catch(e) {
        return onGet(e);
      }
    });
  };
};


/** 
 * CommandRouter factory
 * @return {module:command/router~CommandRouter}
 * @param {array} argv - Args of the process (process.argv)
 */
module.exports.create = function(argv) {
  return new CommandRouter(argv);
};
