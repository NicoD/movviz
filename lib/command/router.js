/**
 * Routing from args module
 * @module command/router
 */
'use strict';


var MongoClient = require('mongodb').MongoClient,
  Command = require('commander').Command,
  events = require('events'),
  util = require('util'),
  readline = require('readline'),
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
  events.EventEmitter.call(this);

  // command line form description
  program.version('1.0.0')
    .description('import a list')
    .option('-c, --cmd [cmd]', 'Command', /^(import|list)$/i)
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


          controller.on('process-done', function() {
            db.close();
          });

          onGet(null, controller);
          break;


        case "list":

          var rargs = readline.createInterface(process.stdin, process.stdout),
              lines = program.lines || 0,
              criteria;

          self.once('criteria-ready', function(criteria) {

            controller = require('../list/lister').create(criteria, movieRepository);

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
                    process.stdin.on('data', function() {
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


            controller.on('process-done', function() {
              db.close();
              rargs.close();
            });

            onGet(null, controller);
          });


          if(program.criteria) {
            var definition = require('../repository/movie/criteria').create()
                                                                    .findByName(program.criteria);
            if(definition && definition.args) {
              
              var args = [],
                  definitionArgs = definition.args.slice(0); // clone
              var readNextArg = function() {
                var argDef = definitionArgs.shift();
                rargs.question(argDef.name + ' : ', function(value) {
                  args.push(argDef.transform ? argDef.transform(value) : value);
                  if(definitionArgs.length > 0) {
                    readNextArg();
                  } else {
                    var criteria = { "$where": definition.getWhere(args)};
                    self.emit('criteria-ready', criteria);
                  }  
                });
              };
              readNextArg();    
            } else {
              self.emit('criteria-ready');
            }
          } else {
            self.emit('criteria-ready');
          }
          break;


        default:
          db.close();
          return onGet(new self.CommandError("unknown command '%s'", program.cmd));
      }
    });
  };
};

util.inherits(CommandRouter, events.EventEmitter);

/** 
 * CommandRouter factory
 * @return {module:command/router~CommandRouter}
 * @param {array} argv - Args of the process (process.argv)
 */
module.exports.create = function(argv) {
  return new CommandRouter(argv);
};
