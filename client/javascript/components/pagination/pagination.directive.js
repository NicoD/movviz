(function() {
  'use strict';

  angular
    .module('movvizApp')
    .directive('mzPagination', Pagination);


  function Pagination() {
    return {
      restrict: 'E',
      templateUrl: '/components/pagination/pagination.partial.html'
    };
  }
}());