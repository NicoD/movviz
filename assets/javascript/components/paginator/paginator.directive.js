(function() {
  'use strict';

  angular
    .module('movvizApp')
    .directive('pagination', pagination);


  function pagination() {
    return {
      restrict: 'E',
      templateUrl: '/components/paginator/pagination.partial.html'
    };
  }
}());