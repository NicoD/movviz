(function() {
  'use strict';

  describe('Testing routes', function() {
  
    var $location,
        $route, 
        $rootScope,
        $httpBackend;

    beforeEach(function() {
      module('movvizApp');

      inject(function(_$location_, _$route_, _$rootScope_, _$httpBackend_) {
        $location      = _$location_;
        $route         = _$route_;
        $rootScope     = _$rootScope_;
        $httpBackend   = _$httpBackend_;
      });
    });


    function testLocation(path, expectedController, expectedTemplate) {
      $location.path(path);
      $rootScope.$digest();
      expect($route.current.controller).to.be.equals(expectedController);
      expect($route.current.templateUrl).to.be.equals(expectedTemplate);
      return {
        then: function(path, nextExpectedController, nextExpectedTemplate) {
          return testLocation(path, 
                              nextExpectedController ? nextExpectedController : expectedController, 
                              nextExpectedTemplate   ? nextExpectedTemplate   : expectedTemplate
                             );
        }
      };
    }

    it('should load the list as default', function() {
      $httpBackend.expectGET('movielist.partial.html').respond(200);
      testLocation('/', 'MovieListController', 'movielist.partial.html')
          .then('/movies')
          .then('/movies/56')
          .then('/movies/test%20')
          .then('/movies/test%56/16');

    });

    it('should find movie detail route', function() {
      $httpBackend.expectGET('moviedetail.partial.html').respond(200);
      testLocation('/movie/123456', 'MovieDetailController', 'moviedetail.partial.html');
    });
  });

}());
