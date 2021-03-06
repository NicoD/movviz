(function() {
  'use strict';

  angular
    .module('movvizApp')
    .config(config);

  config.$inject = ['$routeProvider'];

  function config($routeProvider) {
    $routeProvider.
    when('/', {
      templateUrl: 'customlistlist.partial.html',
      controller: 'CustomlistListController'
    }).
    when('/logout', {
      template: null,
      controller: 'LogoutController'
    }).
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
    when('/import', {
      templateUrl: 'import.partial.html',
      controller: 'ImportController'
    }).
    otherwise({
      redirectTo: '/movies'
    });
  }

}());