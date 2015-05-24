/**
 * command list action  builder
 * @module command/builder/list
 */
'use strict';

var readline = require('readline'),
  events = require('events'),
  movieRepositoryFactory = require('../../repository/movie'),
  movieCriteriaRepositoryFactory = require('../../repository/movie/criteria'),
  actionFactory = require('../../action/list');


/**
 * Callback used when the action is build
 * @callback module:command/builder/list~onBuild
 * @param {string} error
 * @param {Object} action
 */

/**
 * list action builder
 * @param {Object} db - database connection
 * @param {Object} program - cmd line result
 * @param {module:command/builder/list~onBuild} onBuild
 */
exports.create = function(db, program, onBuild) {

  var rargs = readline.createInterface(process.stdin, process.stdout),
    lines = program.lines || 0,
    criteria,
    eventEmitter = new events.EventEmitter();

  // criteria are gonna be read through stdin
  // we have to wait before creating the action 
  eventEmitter.once('criteria-ready', function(criteria) {

    var action = actionFactory.create(
      criteria, {},
      movieRepositoryFactory.create(db)
    );

    // create a proxy of the process command to display the results
    action._process = action.process;
    action.process = function() {

      var pos = 0,
        movie,
        iterated = 0;
      action._process(function(err, iterator) {
        if(err) {
          return onBuild(err);
        }
        var iterate = function(err, obj) {
          if(err) {
            return onBuild(err);
          }

          if(!obj) {
            return;
          }

          console.log('#' + (pos++) + ' - ' + obj.title + ' - ' + obj.rating);
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
      });
    };

    action.on('process-done', function() {
      rargs.close();
    });
    onBuild(null, action);
  });


  // now read the criteria from stdin
  if(program.criteria) {
    var definition = movieCriteriaRepositoryFactory.create()
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