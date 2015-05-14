/**
 * Routing from args module
 * @module command/router
 */
'use strict';


var MongoClient = require('mongodb').MongoClient,
  Command = require('commander').Command,
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
    .option('-c, --cmd [cmd]', 'Command', /^(import)$/i, 'import')
    .option('-s, --source [source]', 'source (url or path)')
    .option('-v, --verbose', 'verbose mode');

  // command line help callback
  program.on('--help', function() {
    console.log('  Examples:');
    console.log('');
    console.log('    $ node movies.js --cmd=import --source=/tmp/file.csv');
    console.log('');
  });

  program.parse(argv);

  /**
   * CommandRouter specific error
   * @class
   */
  this.CommandError = function(message) {
    this.message = message;
    logger.log('error', message);
  };
  this.CommandError.prototype = Object.create(Error.prototype);
  this.CommandError.prototype.toString = function() {
    return 'EXCEPTION> ' + this.message + "\n" + program.helpInformation();
  };


  /**
   * Do the routing and generate the acion coreesponding to the given args.
   * @param {module:command/router~CommandRouter~onGet} onGet
   */
  this.get = function(onGet) {

    // initialize the verbose mode
    logger.level = program.verbose ? 'info' : 'error';
    logger.log('info', 'running command %s', program.cmd);

    // create the action
    switch(program.cmd) {
      case "import":
        if(!program.source) {
          return onGet(new this.CommandError("source not set"));
        }
        MongoClient.connect('mongodb://localhost:27017/movviz', function(err, db) {
          if(err) {
            return onGet(err);
          }

          var movieRepository = require('../repository/movie').create(db),
              importer = require('../import/importer').create(
                           require('../import/fileReader').create(program.source),
                           movieRepository
                         );
        console.log('AAAAAAAAAAAAA');
          importer.on('import-done', function() {
                                       movieRepository.count(function(err, count) {
                                         logger.log('info', 'total stored: ' + count);
                                         db.close();
                                       });
                                     });
          console.log('BNBBB');
          onGet(null, importer);
        });
        break;

      default:
        return onGet(new this.CommandError("unknown command '%s'", program.cmd));
    }
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
