(function() {
  'use strict';

  angular
    .module('movvizApp')
    .controller('ImportController', ImportController);

  ImportController.$inject = ['$scope', '$location', '$auth', 'FileUpload'];


  /**
   * status are
   *   [init]  => [uploading] => [processing] => [done]
   *     |             |               |           |
   *     |             |               |           |
   *  default      progress bar     spinner     results
   */
  function ImportController($scope, $location, $auth, FileUpload) {
    if(!$auth.isAuthenticated()) {
      $location.path('/');
      return;
    }
    $scope.status = 'init';

    $scope.dynamic = 0;
    $scope.submit = function() {
      var self = this;
      this.status = 'uploading';
      FileUpload.upload({
        url: 'api/import',
        file: this.csvFile
      }).progress(function(evt) {
        self.dynamic = parseInt(100.0 * evt.loaded / evt.total);
        if(self.dynamic === 100) {
          self.status = 'processing';
        }
      }).success(function(data, status, headers, config) {
        self.stats = data;
        self.status = 'done';
      });
    };
  }
}());