(function() {
  'use strict';

  angular
    .module('movvizApp')
    .controller('LogoutController', LogoutController);

  LogoutController.$inject = ['$auth'];

  function LogoutController($auth) {
    if(!$auth.isAuthenticated()) {
      return;
    }

    $auth.logout();
  }
}());