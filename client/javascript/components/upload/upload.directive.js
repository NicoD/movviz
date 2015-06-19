(function() {
  'use strict';

  angular
    .module('movvizApp')
    .directive('upload', UploadDirective);


  UploadDirective.$inject = ['$parse'];

  function UploadDirective($parse) {
    return {
      restrict: 'E',
      templateUrl: '/components/upload/upload.partial.html',
      link: function($scope, element, attrs) {
        var browseBtn = angular.element(element[0].getElementsByClassName('file')[0]);
        var submitBtn = angular.element(element[0].getElementsByClassName('fileinput-upload-button'));
        submitBtn.css('display', 'none');
        browseBtn.bind('change', function() {
          var file = browseBtn[0].files[0];
          if(!file) {
            return;
          }
          if(attrs.progressModel) { // reset the progress
            $parse(attrs.progressModel).assign($scope, 0);
          }
          if(attrs.startedModel) {
            $parse(attrs.startedModel).assign($scope, false);
          }
          var fileCaptionDiv = element[0].getElementsByClassName('file-caption-name')[0];
          if(fileCaptionDiv) {
            fileCaptionDiv.innerHTML = escape(file.name);
          }
          submitBtn.css('display', 'inline-block');
          $scope.$apply(function() {
            $parse(attrs.fileModel).assign($scope, file);
          });
        });
      }
    };
  }
}());