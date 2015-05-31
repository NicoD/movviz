(function() {
  'use strict';

  angular
  .module('movvizApp')
  .filter('encode', encode);

function encode() {
  return function encodeURIFilter(input, rfc3986) {
    var encoded = encodeURIComponent(input);
    if(!!rfc3986) {
      encoded = encoded.replace(/[!'()*]/g, escape);
    }
    return encoded; 
  };
}

})();
