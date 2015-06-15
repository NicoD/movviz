/**
 * File utils
 * @module utils/file
 */
'use strict';

/**
 * @constants
 * @type {String}
 */
var key = 'movviz',

  os = require('os'),
  http = require('http'),
  fs = require('fs'),
  path = require('path'),
  crypto = require('crypto'),
  async = require('async'),
  logger = require('./logger').Logger;

/**
 * generate a determinist temp path from a url
 * @param {String} url - url of the resource
 * @return {String} temp path name
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
 * @param {String} url - url of the resource
 * @return {String} temp path name
 */
module.exports.getTempPath = getTempPath;



/**
 * delete recursivly a folder and its folder children (inverse of rmdir -p)
 * @param {String} path 
 * @param {callback}
 */
var rmdirR = function(dirPath, cb) {
  fs.exists(dirPath, function(exists) {
    if(!exists) {
      return cb();
    }
    fs.readdir(dirPath, function(err, files) {

      var deleteThis = function() {
        fs.rmdir(dirPath, function(err) {
          if(err) {
            return err;
          }
          cb(err);
        });
      };
      if(files.length === 0) {
        deleteThis();
      } else  {
        var _rmdirR = function(file, asynccb) {
          var childPath = dirPath + '/' + file;
          fs.lstat(childPath, function(err, stats) {
            if(err) {
              return asynccb(err);
            }
            if(!stats.isDirectory()) {
              return asynccb(new Error(childPath + ' is not a directory'));
            }
            rmdirR(childPath, asynccb);
          });
        };
        async.map(files, _rmdirR, function(err, results) {
          if(err) {
            return cb(err);
          }
          deleteThis();
        });
      }
    });
  });
};

/**
 * delete recursivly a folder and its folder children (inverse of rmdir -p)
 * @param {String} path 
 * @param {callback}
 */
module.exports.rmdirR = rmdirR;


/**
 * create recursivly a complete folder path (with parents)
 * @param {String} path 
 * @param {Number} mode
 * @param {callback}
 */
var mkdirP = function(dirPath, mode, cb) {
  fs.exists(dirPath, function(exists) {
    if(exists) {
      return cb();
    }
    fs.mkdir(dirPath, mode, function(error) {

      if(error && error.errno === 34) {
        mkdirP(path.dirname(dirPath), mode, function(error) {
          if(error) {
            return cb(error);
          }
          mkdirP(dirPath, mode, cb);
        });
      } else if(cb) {
        return cb(error);
      }
    });
  });
};

/**
 * create recursivly a folder (mkdir -p)
 * @param {String} path 
 * @param {Number} mode
 * @param {callback}
 */
module.exports.mkdirP = mkdirP;


/**
 * download a file identified by a url into the given target
 * @param {String} url of the file
 * @param {String} target file path
 * @param {module:utils/file~onDownload}
 */
var downloadFile = function(url, target, onDownload) {
  logger.log('info', 'downloading \'%s\' into \'%s\'', url, target);
  mkdirP(path.dirname(target), parseInt('0777', 8), function(err) {
    if(err) {
      return onDownload(err, target);
    }

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
  });
};

/**
 * download a file identified by a url into the given target
 * @param {String} url of the file
 * @param {String} target file path
 * @param {module:utils/file~onDownload}
 */
module.exports.downloadFile = downloadFile;


/**
 * @constant
 * @type {String}
 */
var TYPE_URL = 'url';

/**
 * @constant
 * @type {String}
 */
var TYPE_FILE = 'file';


/**
 * Callback used when the file has been prepared
 * @callback module:file~onPrepared
 * @param {String} error
 * @param {String} filePath
 */


/**
 * prepare a file that might come from the web
 * to be able to be read locally
 * @param {String} uri
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