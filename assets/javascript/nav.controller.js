(function() {
  'use strict';

  angular
    .module('movvizApp')
    .controller('NavController', NavController);

  NavController.$inject = ['$scope', '$location'];

  function NavController($scope, $location) {
    $scope.isActive = function(navpath) {
      var path = $location.path();
      if(path === '/') {
        return navpath === path;
      }
      if((path == '/movies' || path.indexOf('/movies/') === 0 || path.indexOf('/movie/') === 0) &&
        navpath == '/movies') {
        return true;
      }
      return false;
    };
  }


}());