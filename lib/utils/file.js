/**
 * File utils
 * @module utils/file
 */
'use strict';

/**
 * @constants
 * @type {string}
 */
var key = 'movviz',

  os = require('os'),
  http = require('http'),
  fs = require('fs'),
  crypto = require('crypto'),
  logger = require('./logger').Logger;

/**
 * Download successfull callback
 * @callback module:utils/file~onDownload
 * @param {string} error
 * @param {string} file written
 */

/**
 * generate a determinist temp path from a url
 * @param {string} url - url of the resource
 * @return {string} temp path name
 */
exports.getTempPath = function(url) {
  return os.tmpdir() +
    '/movviz/' +
    crypto.createHmac('sha', key)
    .update(url)
    .digest('hex');
};


/**
 * download a file identified by a url into the given target
 * @param {string} url of the file
 * @param {string} target file path
 * @param {module:utils/file~onDownload}
 */
exports.downloadFile = function(url, target, onDownload) {
  logger.log('info', 'downloading \'%s\' into \'%s\'', url, target);
  var file = fs.createWriteStream(target),
    request = http.get(url, function(response) {
      response.pipe(file);
      file.on('finish', function() {
        logger.log('info', 'download complete');
        file.close(function() {
          onDownload(null, target);
        });
      });
    }).on('error', function(err) {
      fs.unlink(target);
      onDownload(err);
    });
};