'use strict';



var assert = require('assert'),
  fs = require('fs'),
  Promise = require('promise'),
  FileUtils = require('../../src/utils/file'),
  logger = require('../../src/utils/logger').Logger;

logger.level = 'error';

describe('server/src/utils/file', function() {

  describe('Misc', function() {
    it('should generate a deterministic file name', function() {
      var uri = 'http://www.google.com';
      assert.equal(FileUtils.getTempPath(uri), FileUtils.getTempPath(uri));
    });
  });

  describe('RmDirR', function() {
    it('should delete a folder and its children', function(done) {

      var pCreateFolder = Promise.denodeify(fs.mkdir);

      pCreateFolder('/tmp/test')
        .then(pCreateFolder('/tmp/test/A'))
        .then(pCreateFolder('/tmp/test/A/B'))
        .then(pCreateFolder('/tmp/test/A/B/C'))
        .then(pCreateFolder('/tmp/test/A/B/C2'))
        .then(pCreateFolder('/tmp/test/A/B/C3'))
        .then(pCreateFolder('/tmp/test/A/B/C/D'))
        .then(pCreateFolder('/tmp/test/A/B/C3/D1'))
        .then(pCreateFolder('/tmp/test/A/B/C3/D2'))
        .then(function() {
          FileUtils.rmdirR('/tmp/test', function(err) {
            if(err) {
              return done(err);
            }
            fs.exists('/tmp/test', function(exists) {
              if(exists) {
                return done(new Error('should not exist'));
              }
              done();
            });
          });
        })
        .catch(function(err) {
          done(err);
        });
    });
  });

  describe('MkDirP', function() {
    it('should create a dir with its parents', function(done) {
      var path = '/tmp/test/1/2/3/4/5/6/7';
      FileUtils.mkdirP(path, parseInt('0777', 8), function(error) {
        if(error) {
          return done(error);
        }

        fs.exists(path, function(exists) {
          if(!exists) {
            return done(new Error('should exist'));
          }
          done();
          FileUtils.rmdirR('/tmp/test/', function() {});
        });
      });
    });
  });

  describe('Download', function() {
    it('should download a file', function(done) {
      FileUtils.downloadFile('http://www.example.com/', FileUtils.getTempPath('myFile'), function(err, file) {
        if(err) {
          throw err;
        }
        fs.exists(file, function(exists) {
          if(exists) {
            done();
          }
        });
      });
    });
  });
});