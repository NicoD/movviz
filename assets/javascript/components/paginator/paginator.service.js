(function() {
  'use strict';

  angular
    .module('movvizApp')
    .factory('paginatorFactory', paginatorFactory);


  paginatorFactory.$inject = ['$location'];

  function paginatorFactory($location) {
    return {
      create: function(urlBuilder, onClick) {
        var paginator = new Paginator();
        paginator.goto = function(page) {
          if(urlBuilder) {
            $location.path(urlBuilder(page));
          } else if(onClick) {
            onClick(page);
          }
          return false;
        };
        return paginator;
      }
    };
  }

  var Paginator = function() {
    this.currentPage = 0;
    this.totalPages = 0;
    this.rangeSize = 10;
  };

  Paginator.prototype.prevPageDisabled = function() {
    return !this.currentPage ? "disabled" : "";
  };
  Paginator.prototype.nextPageDisabled = function() {
    return this.currentPage === this.totalPages - 1 ? "disabled" : "";
  };

  Paginator.prototype.range = function() {
    var ret = [],
        start = Math.max(0, Math.ceil(this.currentPage - this.rangeSize / 2)),
        max = Math.min(this.totalPages, start + this.rangeSize);
    for(var i=start; i<max; i++) {
      ret.push(i);
    }
    return ret;
  };
}());
