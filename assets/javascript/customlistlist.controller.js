(function() {
  'use strict';

  angular
    .module('movvizApp')
    .controller('CustomlistListController', CustomlistListController);

  CustomlistListController.$inject = ['$scope', '$http'];

  function CustomlistListController($scope, $http) {
    var self = this;


    $http.get('/api/customlists/results')
      .success(function(data, status, headers, config) {
        $scope.customlists = data;
      })
      .error(function(data, status, headers, config) {
        console.log('error');
      });
  }

}());