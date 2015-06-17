(function() {
  'use strict';

  angular.module('movvizApp', ['ngRoute', 'satellizer'])

  .config(['$locationProvider',
    function($locationProvider) {
      $locationProvider.html5Mode(true);
    }
  ])

  .config(['$authProvider',
    function($authProvider) {
      $authProvider.google({
        clientId: '386281142777-phvvje6cvtpai6b95bsqt48u3sp2av5s.apps.googleusercontent.com'
      });
    }
  ]);
}());