(function() {
  'use strict';

  angular
    .module('movvizApp')
    .controller('LoginController', LoginController);

  LoginController.$inject = ['$scope', '$auth'];

  function LoginController($scope, $auth) {
    var self = this;

    $scope.authenticate = function(provider) {
      $auth.authenticate(provider);
    };
  }
}());