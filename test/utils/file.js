'use strict';



var assert = require('assert'),
  fs = require('fs'),
  FileUtils = require('../../lib/utils/file');



describe('FileUtils', function() {

  describe('Misc', function() {
    it('should generate a deterministic file name', function() {
      var uri = 'http://www.google.com';
      assert.equal(FileUtils.getTempPath(uri), FileUtils.getTempPath(uri));
    });
  });


  describe('Download', function() {
    it('should download a file', function(done) {
      FileUtils.downloadFile('http://www.example.com/', FileUtils.getTempPath('myFile'), function(err, file) {
        if(err) {
          throw err;
        }
        fs.exists(file, done);
      });
    });
  });
});