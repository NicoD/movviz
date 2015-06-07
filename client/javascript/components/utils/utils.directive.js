(function() {
  'use strict';

  angular
    .module('movvizApp')
    .directive('stopEvent', stopEvent)
    .directive('disabledLink', disabledLink);


  function stopEvent() {
    return {
      restrict: 'A',
      link: function(scope, element, attr) {
        element.bind(attr.stopEvent, function(e) {
          e.stopPropagation();
        });
      }
    };
  }

  function disabledLink() {
    return {
      link: function(scope, element, attr) {
        element.on('click', function(e) {
          e.preventDefault();
        });
      }
    };
  }
}());