(function() {
  'use strict';

  angular
    .module('movvizApp')
    .factory('mzPaginationFactory', PaginationFactory);


  PaginationFactory.$inject = ['$location'];

  function PaginationFactory($location) {
    return {
      create: function(urlBuilder, onClick) {
        var pagination = new Pagination();
        pagination.goto = function(page) {
          if(urlBuilder) {
            $location.path(urlBuilder(page));
          } else if(onClick) {
            onClick(page);
          }
          return false;
        };
        return pagination;
      }
    };
  }

  var Pagination = function() {
    this.currentPage = 0;
    this.totalPages = 0;
    this.rangeSize = 10;
  };

  Pagination.prototype.prevPageDisabled = function() {
    return !this.currentPage ? "disabled" : "";
  };
  Pagination.prototype.nextPageDisabled = function() {
    return this.currentPage === this.totalPages - 1 ? "disabled" : "";
  };

  Pagination.prototype.range = function() {
    var ret = [],
      start = Math.max(0, Math.ceil(this.currentPage - this.rangeSize / 2)),
      max = Math.min(this.totalPages, start + this.rangeSize);
    for(var i = start; i < max; i++) {
      ret.push(i);
    }
    return ret;
  };
}());