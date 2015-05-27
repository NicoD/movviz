(function() {
  'use strict';

  angular
    .module('movvizApp')
    .config(config);

  config.$inject = ['$routeProvider'];

  function config($routeProvider) {
    $routeProvider.
    when('/movies', {
      templateUrl: 'movielist.partial.html',
      controller: 'MovieListController'
    }).
    when('/movies/:page', {
      templateUrl: 'movielist.partial.html',
      controller: 'MovieListController'
    }).
    when('/movies/:search/:page', {
      templateUrl: 'movielist.partial.html',
      controller: 'MovieListController'
    }).
    when('/movie/:id?', {
      templateUrl: 'moviedetail.partial.html',
      controller: 'MovieDetailController'
    }).
    otherwise({
      redirectTo: '/movies'
    });
  }

}());