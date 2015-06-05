(function() {
  'use strict';

  angular
  .module('movvizApp')
  .controller('CustomlistController', CustomlistController);

CustomlistController.$inject = ['$scope', '$http', 'paginatorFactory'];
function CustomlistController($scope, $http, paginatorFactory) {
  var self = this;

  $scope.paginator = paginatorFactory.create(null, changePage);
  $scope.paginator.rangeSize = 5;
  function changePage(page) {
    page--;
    var apiUrl = '/api/customlist/' + $scope.customlist.slug + '/' + page;
    $http.get(apiUrl)
      .success(function(data, status, headers, config) {
        $scope.paginator.currentPage = data.list.pagination.currentPage;
        $scope.paginator.totalPages  = data.list.pagination.totalPages;
        $scope.customlist = data;
      })
      .error(function(data, status, headers, config) {
        console.log(error);
      });
  }

  $scope.paginator.currentPage = $scope.customlist.list.pagination.currentPage;
  $scope.paginator.totalPages = $scope.customlist.list.pagination.totalPages;
}
}()); 
