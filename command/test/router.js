'use strict';

var assert = require('assert'),
  routerFactory = require('../src/router'),
  db = require('../../server/src/db');


describe('command/src/router', function() {

  db.setConfigFileName(__dirname + '/../config/database.test.yaml');

  var getArgv = function(cmd) {
    return cmd.split(' ');
  };


  it('should build an import action', function(done) {
    routerFactory.create(getArgv('nodejs movviz --cmd import -s \'/tmp/test.csv\' --user=123456'))
      .get(function(err, obj) {
        if(err) {
          throw err;
        }

        // force the event to close resources
        obj.emit('process-done');
        done();
      });


  });


  it('cmd line empty: should build throw an error', function(done) {
    routerFactory.create([])
      .get(function(err, obj) {
        if(!err) {
          throw 'should have falied....';
        }
        done();
      });
  });
});
