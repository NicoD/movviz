(function() {
  'use strict';

  angular
    .module('movvizApp')
    .controller('CustomlistController', CustomlistController);

  CustomlistController.$inject = ['$scope', '$http', 'mzPaginationFactory'];

  function CustomlistController($scope, $http, mzPaginationFactory) {
    var self = this;

    $scope.pagination = mzPaginationFactory.create(null, changePage);
    $scope.pagination.rangeSize = 5;

    function changePage(page) {
      page--;
      var apiUrl = '/api/customlist/' + $scope.customlist.slug + '/' + page;
      $http.get(apiUrl)
        .success(function(data, status, headers, config) {
          $scope.pagination.currentPage = data.list.pagination.currentPage;
          $scope.pagination.totalPages = data.list.pagination.totalPages;
          $scope.customlist = data;
        })
        .error(function(data, status, headers, config) {
          console.log(error);
        });
    }

    $scope.pagination.currentPage = $scope.customlist.list.pagination.currentPage;
    $scope.pagination.totalPages = $scope.customlist.list.pagination.totalPages;
  }
}());