/**
 * import file reader
 * @module import/fileReader
 */
'use strict';

var fileUtils = require('../utils/file'),
  logger = require('../utils/logger').Logger,

  /**
   * @constant
   * @type {string}
   */
  TYPE_URL = 'url',

  /**
   * @constant
   * @type {string}
   */
  TYPE_FILE = 'file',


  /**
   * return the source type according the source uri
   * @param {string} uri
   * @return {string}
   */
  getUriType = function(uri) {
    return(uri.indexOf('http://') === 0 || uri.indexOf('https://') === 0) ? TYPE_URL : TYPE_FILE;
  },


  /**
   * FileReader is used to handle the file to import
   * @class
   * @param {string} fileName
   */
  FileReader = function(sourceUri) {

    /**
     * Callback used when the file has been prepared
     * @callback module:import/fileReader~FileReader~onPrepared
     * @param {string} error
     * @param {string} filePath
     */

    var type = getUriType(sourceUri);

    /**
     * prepare the source according to its type (copy, download ...)
     * 
     * @param {module:import/fileReader~FileReader~onPrepared}
     */
    this.prepare = function(onPrepared) {
      // if its a url, download the file
      switch(type) {
        case TYPE_URL:
          var tempFilePath = fileUtils.getTempPath(sourceUri);
          fileUtils.downloadFile(sourceUri, fileUtils.getTempPath(sourceUri), onPrepared);
          break;


        case TYPE_FILE:
          onPrepared(null, sourceUri);
          break;

        default:
          onPrepared('unknwon file type');
          break;
      }
    };


    /**
     * return friendly info about the source
     * @return {string}
     */
    this.getSourceInfo = function() {
      return sourceUri + ' [' + type + ']';
    };
  };


/** 
 * FileReader factory
 * @param {string} uri
 * @return {module:import/fileReader~FileReader}
 */
module.exports.create = function(uri) {
  return new FileReader(uri);
};