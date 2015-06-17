(function() {
  'use strict';

  angular
    .module('movvizApp')
    .controller('LoginController', LoginController);

  LoginController.$inject = ['$scope', '$auth', 'Account'];

  function LoginController($scope, $auth, Account) {
    if($auth.isAuthenticated()) {
      Account.getProfile()
        .success(function(data) {
          $scope.user = data;
        });
    }

    $scope.authenticate = function(provider) {
      $auth.authenticate(provider);
    };

    $scope.isAuthenticated = function() {
      return $auth.isAuthenticated();
    };
  }
}());