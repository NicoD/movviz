/**
 * command list action builder
 * @module command/builder/list
 */
'use strict';

var readline = require('readline'),
  events = require('events'),
  util = require('util'),
  movieModelFactory = require('../../../server/src/model/movie'),
  movieCriteriaModelFactory = require('../../../server/src/model/movie/criteria'),
  logger = require('../../../server/src/utils/logger').Logger;

/**
 * List is used to ... to list the movies
 * @class
 * @param {Object} criteria
 * @param {Object} pagination
 * @param {Number} lines
 * @param {Object} repository
 */
var ListAction = function(criteria, pagination, lines, repository) {

  var self = this;
  events.EventEmitter.call(this);

  /**
   * process the import
   * @param {callback}
   */
  this.process = function(cb) {
    logger.log('info', 'listing movies' + (criteria ? ' using criteria ' + JSON.stringify(criteria) : ''));
    var pos = 0, iterated = 0;
    var rargs = readline.createInterface(process.stdin, process.stdout);
    repository.findWithPagination(criteria, pagination, function(err, movieRes) {
      if(err) { return cb(err); }

      var stream = movieRes.stream();
      stream.on('data', function(movie) {
        var self = this; 
        console.log('#' + (pos++) + ' - ' + movie.title + ' - ' + movie.rating); 
        iterated++;
        if(lines && iterated >= lines) {
          this.pause();
          process.stdout.write("\nPress any key to continue...");
          process.stdin.once('data', function() {
            process.stdout.write("\n");
            iterated = 0;
            self.resume();
          });
        }
      }).on('error', function(err) {
        cb(err);
      }).on('close', function() {
        rargs.close();
        self.emit('process-done');
        cb();
      });
    });
  };
};

util.inherits(ListAction, events.EventEmitter);


/**
 * list action builder
 * @param {Object} db - database connection
 * @param {Object} program - cmd line result
 * @param {callback} cb
 */
module.exports.create = function(db, program, cb) {

  var lines = program.lines || 0,
      eventEmitter = new events.EventEmitter();

  // criteria are gonna be read through stdin
  // we have to wait before creating the action 
  eventEmitter.once('criteria-ready', function(criteria) {
    cb(null, new ListAction(criteria, {}, lines, movieModelFactory.create(db)));
  });


  // now read the criteria from stdin
  if(program.criteria) {
    var rargs = readline.createInterface(process.stdin, process.stdout);
    var definition = movieCriteriaModelFactory.create().findByName(program.criteria);
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
            var criteria = {
              "$where": definition.getWhere(args)
            };
            eventEmitter.emit('criteria-ready', criteria);
          }
        });
      };
      readNextArg();
    } else {
      eventEmitter.emit('criteria-ready');
    }
  } else {
    eventEmitter.emit('criteria-ready');
  }
};
