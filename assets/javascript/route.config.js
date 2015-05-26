(function() {
  'use strict';

  angular
    .module('movvizApp')
    .config(config);

  config.$inject = ['$routeProvider'];

  function config($routeProvider) {
    $routeProvider.
    when('/movies', {
      templateUrl: 'partial/movie-list',
      controller: 'MovieListController'
    }).
    when('/movies/:page', {
      templateUrl: 'partial/movie-list',
      controller: 'MovieListController'
    }).
    when('/movies/:search/:page', {
      templateUrl: 'partial/movie-list',
      controller: 'MovieListController'
    }).
    when('/movie/:id?', {
      templateUrl: 'partial/movie-detail',
      controller: 'MovieDetailController'
    }).
    otherwise({
      redirectTo: '/movies'
    });
  }

}());