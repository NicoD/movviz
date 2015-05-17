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
var getTempPath = function(url) {
  return os.tmpdir() +
    '/movviz/' +
    crypto.createHmac('sha', key)
    .update(url)
    .digest('hex');
};

/**
 * generate a determinist temp path from a url
 * @param {string} url - url of the resource
 * @return {string} temp path name
 */
module.exports.getTempPath = getTempPath;


/**
 * download a file identified by a url into the given target
 * @param {string} url of the file
 * @param {string} target file path
 * @param {module:utils/file~onDownload}
 */
var downloadFile = function(url, target, onDownload) {
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

/**
 * download a file identified by a url into the given target
 * @param {string} url of the file
 * @param {string} target file path
 * @param {module:utils/file~onDownload}
 */
module.exports.downloadFile = downloadFile;


/**
 * @constant
 * @type {string}
 */
var  TYPE_URL = 'url';

/**
 * @constant
 * @type {string}
 */
var TYPE_FILE = 'file';


/**
 * Callback used when the file has been prepared
 * @callback module:file~onPrepared
 * @param {string} error
 * @param {string} filePath
 */


/**
 * prepare a file that might come from the web
 * to be able to be read locally
 * aram {string} uri
 * @param {module:file~onPrepared} onPrepared
 */
module.exports.prepare = function(uri, onPrepared) {
  var type = (uri.indexOf('http://') === 0 || uri.indexOf('https://') === 0) ? TYPE_URL : TYPE_FILE;
  
  // if its a url, download the file
  switch(type) {
     case TYPE_URL:
       downloadFile(uri, getTempPath(uri), onPrepared);
       break;

     case TYPE_FILE:
       onPrepared(null, uri);
       break;

     default:
       onPrepared('unknwon file type');
       break;
  }

};
