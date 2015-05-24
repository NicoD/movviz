(function(exports) {
  'use strict';


  var movvizControllers = angular.module('movvizControllers', []);

  movvizControllers.controller('MovvizListCtrl', ['$scope', '$http', '$routeParams', '$window',
    function($scope, $http, $routeParams, $window) {
      
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
      var movies = $scope.movies = [];
      var apiUrl = '/api/movies/';
      if($scope.searchPattern) {
        apiUrl += encodeURIComponent($scope.searchPattern) + '/';
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

      if($scope.searchPattern) {
        $scope.searchPatternForm = $scope.searchPattern;
      }



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

      $scope.goto = function(page) {
        page = page || 1;
        var target = '#/movies/';
        if(this.searchPattern) {
          target += encodeURIComponent(this.searchPattern) + '/';
        }
        if(page) {
          target += page + '/';
        }
        $window.location.href = target;
        return false;
      };


      $scope.search = function() {
        // i use this trick so that the search input is directly binding
        // to a temp variable scope, so that the search function validate the
        // current search. This is used to prevent navigation from using the search
        // pattern if it has not been submited
        this.searchPattern = this.searchPatternForm;
        this.goto();
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
