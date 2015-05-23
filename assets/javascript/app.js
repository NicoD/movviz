(function(exports) {
  'use strict';

  var movvizApp = angular.module('movvizApp', [
    'ngRoute',
    'movvizControllers'
  ]);


  movvizApp.config(['$routeProvider',
    function($routeProvider) {
      $routeProvider.
        when('/movies/:page?', {
          templateUrl: 'partial/movie-list',
          controller:  'MovvizListCtrl'
        }).
        when('movvies/:movieId/?', {
          templateUrl: 'partial/movie-detail',
          controller: 'MovvizDetailCtrl'
        }).
        otherwise({
          redirectTo: '/movies'
        });
     }  
  ]);
}(window));
