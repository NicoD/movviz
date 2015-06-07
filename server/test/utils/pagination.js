'use strict';


var assert = require('assert'),
  sinon = require('sinon'),
  Promise = require('promise'),
  PaginationFactory = require('../../src/utils/pagination'),
  logger = require('../../src/utils/logger').Logger;

logger.level = 'error';

describe('server/src/utils/pagination', function() {

  /** 
   * helper function that create a mongodb result mock
   * @param {Number} skip - skip expected (null if never)
   * @param {Number} limit - limit expected (null if never)
   * @param {Function} test
   * @return {Object}
   */
  function testPagination(skip, limit, test) {
    var resultAPI = {
      skip: function() {},
      limit: function() {}
    };
    var mockResult = sinon.mock(resultAPI);
    if(skip) {
      mockResult.expects("skip").withArgs(skip);
    } else {
      mockResult.expects("skip").never();
    }

    if(limit) {
      mockResult.expects("limit").withArgs(limit);
    } else {
      mockResult.expects("limit").never();
    }

    test(resultAPI);
    mockResult.verify();
  }

  it("should have a standard valid pagination", function() {
    testPagination(0, 5, function(resultAPI) {
      var pagination = PaginationFactory.create(0, 5);
      pagination.applyTo(resultAPI, 140);
      assert.equal(pagination.totalResults, 140);
      assert.equal(pagination.totalPages, 28);
    });
  });

  it("should have a valid pagination for a specific page", function() {

    testPagination(100, 5, function(resultAPI) {
      var pagination = PaginationFactory.create(20, 5);
      pagination.applyTo(resultAPI, 140);
      assert.equal(pagination.totalResults, 140);
      assert.equal(pagination.totalPages, 28);
    });
  });

  it("should have a valid pagination for few results", function() {
    testPagination(0, 0, function(resultAPI) {
      var pagination = PaginationFactory.create(0, 5);
      pagination.applyTo(resultAPI, 3);
      assert.equal(pagination.totalResults, 3);
      assert.equal(pagination.totalPages, 1);
    });
  });

  it("should have a valid validation for no results", function() {
    testPagination(0, 0, function(resultAPI) {
      var pagination = PaginationFactory.create(3, 5);
      pagination.applyTo(resultAPI, 0);
      assert.equal(pagination.totalResults, 0);
      assert.equal(pagination.totalPages, 0);
    });
  });
});