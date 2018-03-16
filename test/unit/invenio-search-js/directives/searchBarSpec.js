/*
 * This file is part of Invenio.
 * Copyright (C) 2015-2018 CERN.
 *
 * Invenio is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

'use strict';

describe('Check searchbar directive', function() {

  var $compile;
  var $rootScope;
  var $httpBackend;
  var $window;
  var scope;
  var template;

  // Load the templates
  beforeEach(angular.mock.module('templates'));

  // Inject the angular module
  beforeEach(angular.mock.module('invenioSearch'));

  beforeEach(
    inject(function(_$compile_, _$rootScope_, _$httpBackend_, _$window_) {

      $compile = _$compile_;
      $httpBackend = _$httpBackend_;
      $rootScope = _$rootScope_;
      $window = _$window_;
      scope = $rootScope;

      template = '<invenio-search search-endpoint="/api" ' +
       'search-hidden-params=\'{"hero": "jessicajones"}\'> ' +
       '<invenio-search-bar template="src/invenio-search-js/templates/searchBar.html" ' +
       'placeholder="Type something"></invenio-search-bar>' +
       '</invenio-search>';

      var response = {
        links: {
          self: 'http://hello?size=20&page=20&sort=harleyquinn'
        }
      }

      // Expect a request
      $httpBackend.whenGET('/api?page=1&size=20&hero=jessicajones').respond(200, response);
      $httpBackend.whenGET('/api?page=1&size=20&q=' + $window.encodeURIComponent('jarvis: get to the choppa') + '&hero=jessicajones').respond(200, response);
      $httpBackend.whenGET('/api?page=1&size=20&q=' + $window.encodeURIComponent('jarvis: get to the choppa') + '&hero=jessicajones').respond(200, response);
      $httpBackend.whenGET('/api?page=1&size=20&q=' + $window.encodeURIComponent('jarvis:call Jessica Jones') + '&hero=jessicajones').respond(200, response);

      // Compile
      template = $compile(template)(scope);
      template.scope().userQuery = 'jarvis: get to the choppa';

      scope.vm.invenioSearchCurrentArgs.params.q = 'jarvis: get to the choppa';
      // Digest
      scope.$digest();
    })
  );

  it('should have attributes', function() {
    // Expect the place holder to have value
    expect(template.scope().placeholder).to.be.equal('Type something');
  });

  it('should change the query', function() {
    // Update the input
    scope.vm.userQuery = 'jarvis:call Jessica Jones';
    template.find('input').val('jarvis:call Jessica Jones');
    template.scope().updateQuery();
    scope.$digest();

    expect(template.find('input').val()).to.be.equal(
      scope.vm.invenioSearchCurrentArgs.params.q
    );
  });

  it('should not have hidden parameters in the query', function() {
    expect(scope.vm.invenioSearchCurrentArgs.hero).to.be.undefined;
  });

  it('should have hidden parameter', function() {
    expect(scope.vm.invenioSearchHiddenParams.hero).to.be.equal('jessicajones');
  });

  it('should have saved the sortParameter form the API', function() {
    // Update the input
    scope.vm.userQuery = 'jarvis:call Jessica Jones';
    template.find('input').val('jarvis:call Jessica Jones');
    template.scope().updateQuery();
    scope.$digest();

    $httpBackend.flush();
    expect(scope.vm.invenioSearchSortArgs.sort).to.be.equal('harleyquinn');
  });

});
