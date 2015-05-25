(function(exports) {
  'use strict';


  var movvizControllers = angular.module('movvizControllers', []);

  movvizControllers.controller('MovvizListCtrl', ['$scope', '$http', '$routeParams', 'paginatorFactory',
    function($scope, $http, $routeParams, paginatorFactory) {
      
      var page = parseInt($routeParams.page, 10);
      $scope.searchPattern = $routeParams.search;
      // just to reorganize parametes to allow better urls
      if(!$routeParams.search && $routeParams.page && (isNaN(page) || page%1)) {
        page = 0;
        $scope.searchPattern = $routeParams.page; // inverted arg
      } 
      else if(isNaN(page) || page%1) { 
        page = 0; 
      } else {
        page--;
      }
     
      // set the paginator
      $scope.paginator = paginatorFactory.create(function(page) {
        page = page || 1;
        var target = '/movies/';
        if($scope.searchPattern) {
          target += encodeURIComponent($scope.searchPattern) + '/';
        }
        if(page) {
          target += page + '/';
        }
        return target;
      });

      
      var movies = $scope.movies = [];
      var apiUrl = '/api/movies/';
      if($scope.searchPattern) {
        apiUrl += encodeURIComponent($scope.searchPattern) + '/';
      }
      apiUrl += page;

      $http.get(apiUrl)
           .success(function(data, status, headers, config) {
              $scope.movies = data.movies;

              $scope.paginator.currentPage = data.pagination.currentPage;
              $scope.paginator.totalPages  = data.pagination.totalPages;
           })
           .error(function(data, status, headers, config) {
              console.log('error');
           });

      if($scope.searchPattern) {
        $scope.searchPatternForm = $scope.searchPattern;
      }


      $scope.search = function() {
        // i use this trick so that the search input is directly binding
        // to a temp variable scope, so that the search function validate the
        // current search. This is used to prevent navigation from using the search
        // pattern if it has not been submited
        $scope.searchPattern = $scope.searchPatternForm;
        $scope.paginator.goto();
      };

      $scope.$on('$viewContentLoaded', function() { 
        $('#movie-list .form > form').affix({
          offset: {
            top:0
          }
        });
      });
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
