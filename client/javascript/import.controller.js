(function() {
  'use strict';

  angular
    .module('movvizApp')
    .controller('ImportController', ImportController);

  ImportController.$inject = ['$scope', '$location', '$auth', 'FileUpload'];

  function ImportController($scope, $location, $auth, FileUpload) {
    if(!$auth.isAuthenticated()) {
      $location.path('/');
      return;
    }

    $scope.dynamic = 0;
    $scope.submit = function() {
      var self = this;
      this.started = true;
      FileUpload.upload({
        url: 'api/import',
        file: this.csvFile
      }).progress(function(evt) {
        self.dynamic = parseInt(100.0 * evt.loaded / evt.total);
        console.log('progress ' + self.dynamic + '%' + evt.config.file.name);
      }).success(function(data, status, headers, config) {
        console.log('file ' + config.file.name + 'uploaded. Response ' + data);
      });
    };
    $scope.started = false;
  }
}());