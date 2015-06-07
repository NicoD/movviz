(function() {
  'use strict';

  angular
    .module('movvizApp')
    .filter('encode', encode)
    .filter('ucfirst', ucfirst)
    .filter('ucword', ucword);

  function encode() {
    return function encodeURIFilter(input, rfc3986) {
      var encoded = encodeURIComponent(input);
      if(!!rfc3986) {
        encoded = encoded.replace(/[!'()*]/g, escape);
      }
      return encoded;
    };
  }

  function ucfirst() {
    return function ucfirstFilter(input) {
      return input.charAt(0).toUpperCase() + input.slice(1);
    };
  }

  function ucword() {
    return function ucwordFilter(input) {
      var words = input.split(" ");
      var nbWords = words.length;
      for(var i = 0; i < nbWords; i++) {
        words[i] = ucfirst()(words[i]);
      }
      return words.join(" ");
    };
  }

})();