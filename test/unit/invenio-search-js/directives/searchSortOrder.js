/*
 * This file is part of Invenio.
 * Copyright (C) 2016-2018 CERN.
 *
 * Invenio is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

'use strict';

describe('Check search sort order directive', function() {

  var $compile;
  var $httpBackend;
  var $rootScope;
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
      $httpBackend.whenGET('/api?page=1&size=20&sort=').respond(200, {success: true});
      $httpBackend.whenGET('/api?page=1&size=20&sort=-').respond(200, {success: true});
      $httpBackend.whenGET('/api?page=1&size=20&sort=date').respond(200, {success: true});
      $httpBackend.whenGET('/api?page=1&size=20&sort=-date').respond(200, {success: true});
      $httpBackend.whenGET('/api?page=1&size=20&sort=-title').respond(200, {success: true});

      template = '<invenio-search search-endpoint="/api"> ' +
        '<invenio-search-sort-order ' +
          'sort-key="sort" ' +
          'template="src/invenio-search-js/templates/toggleButton.html" ' +
        '>' +
       '<invenio-search-select-box ' +
        'sort-key="sort"' +
        'available-options=\'{"options": [{"title": "Title", "value": "-title"}, {"title": "Date", "value": "date"}]}\' ' +
        'template="src/invenio-search-js/templates/selectBox.html" ' +
       '>' +
       '</invenio-search-select-box>' +
       '</invenio-search-sort-order>' +
      '</invenio-search>';

      template = $compile(template)(scope);
      scope.$digest();
    })
  );

  it('should have change the sort to descending', inject(function($timeout) {
    // Select should have date as value
    scope.vm.invenioSearchArgs.sort = "date";
    template.find('select').eq(0).val('desc');
    template.find('select').eq(0).triggerHandler('change');
    scope.$digest();
    $timeout.flush();
    expect(scope.vm.invenioSearchArgs.sort).to.be.equal('-date');
  }));

  it('should have change the sort to ascending', inject(function($timeout) {
    // Select should have date as value
    scope.vm.invenioSearchArgs.sort = "-date";
    template.find('select').eq(0).val('desc');
    template.find('select').eq(0).triggerHandler('change');
    template.find('select').eq(0).val('asc');
    template.find('select').eq(0).triggerHandler('change');
    scope.$digest();
    $timeout.flush();
    expect(scope.vm.invenioSearchArgs.sort).to.be.equal('date');
  }));

  it('should change the sort to desceding', inject(function($timeout) {
    // Select should have date as value
    scope.vm.invenioSearchArgs.sort = "-title";
    template.find('select').eq(0).val('desc');
    template.find('select').eq(0).triggerHandler('change');
    scope.$digest();
    $timeout.flush();
    expect(scope.vm.invenioSearchArgs.sort).to.be.equal('-title');
    // Change value
    scope.vm.invenioSearchArgs.sort = "-date";
    template.find('select').eq(0).val('asc');
    template.find('select').eq(0).triggerHandler('change');
    scope.$digest();
    expect(scope.vm.invenioSearchArgs.sort).to.be.equal('date');
  }));

  it('should change the sort to desceding on default sort key', inject(function($timeout) {
    // Select should have empty value
    scope.vm.invenioSearchArgs.sort = ''
    scope.vm.invenioSearchCurrentArgs.sort = ''
    scope.data = {};
    template.find('select').eq(0).val('desc');
    template.find('select').eq(0).triggerHandler('change');
    scope.$digest();
    $timeout.flush();
    expect(scope.vm.invenioSearchArgs.sort).to.be.equal('-');
    // Change value
    scope.vm.invenioSearchArgs.sort = "-date";
    template.find('select').eq(0).val('asc');
    template.find('select').eq(0).triggerHandler('change');
    scope.$digest();
    expect(scope.vm.invenioSearchArgs.sort).to.be.equal('date');
  }));
});
