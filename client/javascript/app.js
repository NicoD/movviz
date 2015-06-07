(function() {
  'use strict';

  angular.module('movvizApp', ['ngRoute'])

  .config(['$locationProvider',
    function($locationProvider) {
      $locationProvider.html5Mode(true);
    }
  ]);
}());