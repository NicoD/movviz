/**
 * Pagination utils
 * @module utils/pagination
 */
'use strict';

var logger = require('../utils/logger').Logger,

  /**
   * create a new pagination object
   * @class
   * @param {Number} page - current page
   * @param {Number} resultsPerPage
   */
  Pagination = function(page, resultsPerPage) {
    this.page = page;
    this.resultsPerPage = resultsPerPage;
    this.currentPage = this.page;
    this.totalPages = -1;
    this.totalResults = -1;
  };


/**
 * apply the mongodb results to the current pagination
 * @param {Object} results - mongodb cursor
 * @param {Number} totalResults
 */
Pagination.prototype.applyTo = function(results, totalResults) {

  logger.log('info', 'apply pagination (%d, %d) to %d results', this.page, this.resultsPerPage, totalResults);

  this.totalResults = totalResults;
  if(this.resultsPerPage) {
    this.totalPages = Math.ceil(totalResults / this.resultsPerPage);
    if(this.page && this.totalResults) {
      results.skip(this.page * this.resultsPerPage);
    }
    if(this.totalResults > this.resultsPerPage) {
      results.limit(this.resultsPerPage);
    }
  }
};


/**
 * create a new pagination object
 * @param {Number} page - current page
 * @param {Number} resultsPerPage
 * @return {Object} pagination
 */
module.exports.create = function(page, resultsPerPage) {
  return new Pagination(page, resultsPerPage);
};