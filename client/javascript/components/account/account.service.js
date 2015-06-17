(function() {
  'use strict';

  angular
    .module('movvizApp')
    .factory('Account', Account);

  Account.$inject = ['$http'];

  function Account($http) {
    return {
      getProfile: function() {
        return $http.get('/api/profile');
      }

    };
  }
})();