/*
 * This file is part of Invenio.
 * Copyright (C) 2015-2018 CERN.
 *
 * Invenio is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

'use strict';

describe('Check search loading directive', function() {

  var $compile;
  var $rootScope;
  var $httpBackend;
  var scope;
  var template;

  // load the templates
  beforeEach(angular.mock.module('templates'));

  // Inject the angular module
  beforeEach(angular.mock.module('invenioSearch'));

  beforeEach(
    inject(function(_$compile_, _$rootScope_, _$httpBackend_) {

      $compile = _$compile_;
      $httpBackend = _$httpBackend_;
      $rootScope = _$rootScope_;

      scope = $rootScope;

      // Expect a request
      $httpBackend.whenGET('/api?page=1&size=20').respond(200, {success: true});

      template = '<invenio-search search-endpoint="/api"> ' +
       '<invenio-search-loading template="src/invenio-search-js/templates/loading.html" ' +
       'message="Loading"> <invenio-search-loading>' +
       '</invenio-search>';

      template = $compile(template)(scope);
      scope.$digest();

      scope.vm.invenioSearchLoading = true;
    })
  );

  it('should have attributes', function() {
    expect(template.scope().vm.invenioSearchLoading).to.be.equal(true);
    expect(scope.loadingMessage).to.be.equal('Loading');
  });

  it('should have text', function() {
    expect(template.find('div').text()).to.be.equal('Loading');
  });
});
