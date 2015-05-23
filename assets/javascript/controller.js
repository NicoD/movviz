(function(exports) {
  'use strict';


  var movvizControllers = angular.module('movvizControllers', []);

  movvizControllers.controller('MovvizListCtrl', ['$scope', '$http', '$routeParams',
    function($scope, $http, $routeParams) {
      var movies = $scope.movies = [];
      $http.get('/api/movies/'+$routeParams.page)
           .success(function(data, status, headers, config) {
              $scope.movies = data.movies;

              $scope.currentPage = data.pagination.currentPage;
              $scope.totalPages = data.pagination.totalPages;
           })
           .error(function(data, status, headers, config) {
              console.log('error');
           });

      $scope.range = function() {
        var rangeSize = 10;
        var ret = [];
        var start = Math.max(0, Math.ceil($scope.currentPage-rangeSize/2));
        if(start > $scope.totalPages-rangeSize) {
          start = $scope.totalPages-rangeSize;
        }
        for(var i=start; i<start+rangeSize-1;i++) {
          ret.push(i);
        }
        return ret;
      };

      $scope.prevPageDisabled = function() {
        return !$scope.currentPage ? "disabled" : "";
      };
      $scope.nextPageDisabled = function() {
        return $scope.currentPage === $scope.totalPages-1 ? "disabled" : "";
      };
    }
  ]);

  movvizControllers.controller('MovvizDetailCtrl', ['$scope', '$http',
      function($scope, $http) {


      }
  ]);

}(window));
