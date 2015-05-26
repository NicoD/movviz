(function() {
  'use strict';

  angular
    .module('movvizApp')
    .factory('paginatorFactory', paginatorFactory);


  paginatorFactory.$inject = ['$location'];

  function paginatorFactory($location) {
    return {
      create: function(urlBuilder) {
        var paginator = new Paginator(urlBuilder);
        paginator.goto = function(page) {
          $location.path(urlBuilder(page));
          return false;
        };
        return paginator;
      }
    };
  }

  var Paginator = function() {
    this.currentPage = 0;
    this.totalPages = 0;
  };

  Paginator.prototype.prevPageDisabled = function() {
    return !this.currentPage ? "disabled" : "";
  };
  Paginator.prototype.nextPageDisabled = function() {
    return this.currentPage === this.totalPages - 1 ? "disabled" : "";
  };

  Paginator.prototype.range = function() {
    var rangeSize = 10,
      ret = [],
      start = Math.max(0, Math.ceil(this.currentPage - rangeSize / 2)),
      max = Math.min(this.totalPages, start + rangeSize);
    for(var i = start; i < max; i++) {
      ret.push(i);
    }
    return ret;
  };

}());