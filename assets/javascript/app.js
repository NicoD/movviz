(function(exports) {
  'use strict';

  var movvizApp = angular.module('movvizApp', [
    'ngRoute',
    'movvizControllers'
  ]);


  movvizApp.config(['$locationProvider', '$routeProvider',
    function($locationProvider, $routeProvider) {

      $locationProvider.html5Mode(true);

      $routeProvider.
        when('/movies', {
          templateUrl: 'partial/movie-list',
          controller: 'MovvizListCtrl'
        }).
        when('/movies/:page', {
          templateUrl: 'partial/movie-list',
          controller: 'MovvizListCtrl'
        }).
        when('/movies/:search/:page', {
          templateUrl: 'partial/movie-list',
          controller: 'MovvizListCtrl'
        }).
        when('/movie/:id?', {
          templateUrl: 'partial/movie-detail',
          controller: 'MovvizDetailCtrl'
        }).
        otherwise({
          redirectTo: '/movies'
        });
     }  
  ])




  .directive('stopEvent', function() {
    return {
      restrict: 'A',
      link: function (scope, element, attr) {
        element.bind(attr.stopEvent, function (e) {
          e.stopPropagation();
        });
      }
    };
  })

  .directive('disabledLink', function() {
    return {
      link: function(scope, element, attr) {
        element.on('click', function(e) {
          e.preventDefault();
        });
      }
    };
  })

  .directive('pagination', function() {
    return {
      restrict: 'E',
      templateUrl: 'partial/pagination'
    };
  
  })


  .factory('paginatorFactory', ['$location', function($location) {
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
  }]);

  var Paginator = function() {
    this.currentPage = 0;
    this.totalPages = 0;
  };

  Paginator.prototype.prevPageDisabled = function() {
    return !this.currentPage ? "disabled" : "";
  };
  Paginator.prototype.nextPageDisabled = function() {
    return this.currentPage === this.totalPages-1 ? "disabled" : "";
  };

  Paginator.prototype.range = function() {
    var rangeSize = 10;
    var ret = [];
    var start = Math.max(0, Math.ceil(this.currentPage-rangeSize/2));
    var max = Math.min(this.totalPages, start+rangeSize);
    for(var i=start; i<max;i++) {
      ret.push(i);
    }
    return ret;
  };


}(window));
