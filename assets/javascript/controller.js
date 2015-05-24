(function(exports) {
  'use strict';


  var movvizControllers = angular.module('movvizControllers', []);

  movvizControllers.controller('MovvizListCtrl', ['$scope', '$http', '$routeParams', '$window',
    function($scope, $http, $routeParams, $window) {

      var page = parseInt($routeParams.page, 10), 
          search = $routeParams.search;
      // just to reorganize parametes to allow better urls
      if(!$routeParams.search && $routeParams.page && (isNaN(page) || page%1)) {
        page = 0;
        search = $routeParams.page;
      } 
      else if(isNaN(page) || page%1) { 
        page = 0; 
      } else {
        page--;
      }
      var movies = $scope.movies = [];
      var apiUrl = '/api/movies/';
      if(search) {
        apiUrl += encodeURIComponent(search) + '/';
      }
      apiUrl += page;

      $http.get(apiUrl)
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
        var max = Math.min($scope.totalPages, start+rangeSize);
        for(var i=start; i<max;i++) {
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

      $scope.gotoPage = function(page, $event) {
        page = page || 1;
        var target = '#/movies/'+page;
        $window.location.href = target;
        return false;
      };
    }
  ]);

  movvizControllers.controller('MovvizDetailCtrl', ['$scope', '$http', '$routeParams',
      function($scope, $http, $routeParams) {
        $http.get('/api/movie/'+$routeParams.id)
             .success(function(data, status, headers, config) {
               $scope.movie = data;
             })
             .error(function(data, status, headers, config) {
               console.log('error');
             });

      }
  ]);

}(window));
