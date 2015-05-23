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

  this.currentPage  = this.page;
  this.totalPages   = -1;
  this.totalResults = -1;
};


/**
 * apply the mongodb results to the current pagination
 * @param {Object} results - mongodb cursor
 * @param {Number} totalResults
 */
Pagination.prototype.applyTo = function(results, totalResults) {
  logger.log('info', 'apply pagination (%d, %d) to %d results', this.page, this.resultsPerPage, totalResults);
  if(this.resultsPerPage) {
    if(totalResults) {
      this.totalResults = totalResults;
      this.totalPages = Math.ceil(totalResults/this.resultsPerPage);
    }
    if(this.page) {
      results.skip(this.page*this.resultsPerPage);
    }
    results.limit(this.resultsPerPage);
  }
};


/**
 * create a new pagination object
 * @param {Number} page - current page
 * @param {Number} resultsPerPage
 * @return {module:utils/pagination~Pagination} pagination
 */
module.exports.create = function(page, resultsPerPage) {
  return new Pagination(page, resultsPerPage);
};
