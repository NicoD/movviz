(function() {
  'use strict';

  describe('MovielistController', function() {
    
    beforeEach(module('movvizApp'));

    var $controller; 
    var $httpBackend;
    var $location;
    var $filter;
    var paginatorFactory;

    var $scope;

    beforeEach(inject(function(_$controller_, _$httpBackend_, _$location_, _$filter_, _paginatorFactory_) {
      $controller  = _$controller_;
      $httpBackend = _$httpBackend_;
      $location    = _$location_;
      $filter      = _$filter_;
      paginatorFactory = _paginatorFactory_;

      // location mock object
      $location.path = function(p) {
        if(p) { this.p = p;}
        return this.p;
      };
      $scope = {$on: function() {}};
    }));


    describe('pagination', function() {
      it('check pagination according to params', function() {

        $httpBackend.whenGET('/api/movies/0').respond({pagination: {currentPage: 0}});
        $controller('MovieListController', 
                            { 
                              $scope: $scope, 
                              $routeParams: {}, 
                              paginatorFactory: paginatorFactory
                            }); 
        $httpBackend.flush();
        expect($scope.paginator.currentPage).to.be.equals(0); 

        $httpBackend.whenGET('/api/movies/4').respond({pagination: {currentPage: 5}});
        $controller('MovieListController', 
                            {
                              $scope: $scope,
                              $routeParams: { page: 5 },
                              paginatoryFactory: paginatorFactory
                            });
        $httpBackend.flush();
        expect($scope.paginator.currentPage).to.be.equals(5);
      });


      it('check pagination urls', function() {
        $httpBackend.whenGET('/api/movies/Hey%20Hey%20My%20My/19').respond({pagination: {currentPage: 19}});
        $controller('MovieListController', 
                        {
                          $scope: $scope,
                          $routeParams: {page: 20, search: 'Hey Hey My My'},
                          paginatorFactory: paginatorFactory
                        });
        $httpBackend.flush();
        $scope.paginator.goto(18);
        expect($location.path()).to.be.equals('/movies/Hey%20Hey%20My%20My/18');
        // set a new search string
        $scope.searchPatternForm = 'Rock\'n\'Roll Will Never Die';
        // not validated yet, location should not change
        expect($location.path()).to.be.equals('/movies/Hey%20Hey%20My%20My/18');
        // now its validated, we should have a new location 
        $scope.search();
        expect($location.path()).to.be.equals('/movies/Rock%27n%27Roll%20Will%20Never%20Die/1');
        // now go back with search
        $scope.searchPatternForm = '';
        $scope.search();
        expect($location.path()).to.be.equals('/movies/1');
      });
    });
  });

}());
