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
  
  });


}(window));
