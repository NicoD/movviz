(function() {
  'use strict';

  angular
    .module('movvizApp')
    .controller('MovieDetailController', MovieDetailController);

  MovieDetailController.$inject = ['$scope', '$http', '$routeParams'];

  function MovieDetailController($scope, $http, $routeParams) {
    var self = this;

    $http.get('/api/movie/' + $routeParams.id)
      .success(function(data, status, headers, config) {
        $scope.movie = data;
      })
      .error(function(data, status, headers, config) {
        console.log('error');
      });
  }

}());