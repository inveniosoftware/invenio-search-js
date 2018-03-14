/*
 * This file is part of Invenio.
 * Copyright (C) 2015-2018 CERN.
 *
 * Invenio is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

'use strict';

describe('Check search error directive', function() {

  var $compile;
  var $httpBackend;
  var $rootScope;
  var scope;
  var template;
  var controller;

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

      template = '<invenio-search search-endpoint="/error"> ' +
       '<invenio-search-error message="Yo error" template="src/invenio-search-js/templates/error.html">' +
       '</invenio-search-error>' +
       '</invenio-search>';

      // Expect a request
      $httpBackend.whenGET('/error?page=1&size=20').respond(500, {
        data: {
          message: 'Tell me, do you bleed?'
        }
      });

      template = $compile(template)(scope);
      scope.$digest();
    })
  );

  it('should have attributes', function() {
    $httpBackend.flush();
    expect(template.scope().vm.invenioSearchErrorResults.data.message).to.be.equal('Tell me, do you bleed?');
    expect(template.find('div.alert').text().trim()).to.be.equal('Error: Yo error');
  });
});
