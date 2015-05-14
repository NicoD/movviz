'use strict';

var assert = require('assert'),
  routerFactory = require('../../lib/command/router');


describe('Command', function() {

  var getArgv = function(cmd) {
    return cmd.split(' ');
  };


  it('should build an import action', function(done) {
    routerFactory.create(getArgv('nodejs movviz--cmd import -v -s \'/tmp/test.csv\''))
      .get(function(err, obj) {
        if(err) {
          throw err;
        }
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