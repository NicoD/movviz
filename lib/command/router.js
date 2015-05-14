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

  var program = new Command(),
    self = this;

  // command line form description
  program.version('1.0.0')
    .description('import a list')
    .option('-c, --cmd [cmd]', 'Command', /^(import|list)$/i)
    .option('-s, --source [source]', 'source (url or path)')
    .option('-v, --verbose', 'verbose mode')

  .option('-l, --lines [value]', 'nombre de ligne', parseInt);

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


    // @TODO, for the moment, the db is always mandatory
    MongoClient.connect('mongodb://localhost:27017/movviz', function(err, db) {
      if(err) {
        return onGet(err);
      }


      logger.log('info', 'connection to database');
      var controller,
        movieRepository = require('../repository/movie').create(db);


      // create the action
      switch(program.cmd) {
        case "import":
          if(!program.source) {
            db.close();
            return onGet(new self.CommandError("source not set"));
          }
          controller = require('../import/importer').create(
            require('../import/fileReader').create(program.source),
            movieRepository
          );
          break;


        case "list":
          var lines = program.lines || 0;
          controller = require('../list/lister').create(movieRepository);

          // create a proxy of the process command to display the results
          controller._process = controller.process;
          controller.process = function() {

            var iterator = controller._process(),
              movie,
              iterated = 0,
              iterate = function(err, obj) {
                if(!obj) {
                  return;
                }

                console.log(obj.title + ' - ' + obj.rating);
                iterated++;
                if(lines && iterated >= lines) {
                  process.stdout.write("\nPress any key to continue...");
                  process.stdin.once('data', function() {
                    process.stdout.write("\n");
                    iterated = 0;
                    iterator.next(iterate);
                  });
                } else {
                  iterator.next(iterate);
                }
              };
            iterator.next(iterate);
          };
          break;


        default:
          //db.close();
          return onGet(new self.CommandError("unknown command '%s'", program.cmd));
      }
      controller.on('process-done', function() {
        db.close();
      });
      onGet(null, controller);
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