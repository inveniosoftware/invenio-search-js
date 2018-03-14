/*
 * This file is part of Invenio.
 * Copyright (C) 2015-2018 CERN.
 *
 * Invenio is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

'use strict';

describe('Check search pagination directive', function() {

  var $compile;
  var $httpBackend;
  var $rootScope;
  var $window;
  var scope;
  var template;

  // load the templates
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

      $httpBackend.whenGET('/api?page=1&size=20').respond(200, {success: true});
      $httpBackend.whenGET('/api?page=1&size=3&q=' + $window.encodeURIComponent('jarvis: hello??')).respond(200, {success: true});
      $httpBackend.whenGET('/api?page=1&size=20&q=' + $window.encodeURIComponent('jarvis: hello do you here me?')).respond(200, {success: true});
      $httpBackend.whenGET('/api?page=1&size=3&q=' + $window.encodeURIComponent('jarvis: hello do you here me?')).respond(200, {success: true});
      $httpBackend.whenGET('/api?page=7&size=3&q=' + $window.encodeURIComponent('jarvis: hello do you here me?')).respond(200, {success: true});
      $httpBackend.whenGET('/api?page=7&size=20&q=' + $window.encodeURIComponent('jarvis: hello do you here me?')).respond(200, {success: true});
      $httpBackend.whenGET('/api?page=1&size=3&q=' + $window.encodeURIComponent('jarvis: hello do you here me?')).respond(200, {success: true});
      $httpBackend.whenGET('/api?page=3&size=3&q=' + $window.encodeURIComponent('jarvis: hello do you here me?')).respond(200, {success: true});
      $httpBackend.whenGET('/api?page=4&size=3&q=' + $window.encodeURIComponent('jarvis: hello do you here me?')).respond(200, {success: true});
      $httpBackend.whenGET('/api?page=5&size=3&q=' + $window.encodeURIComponent('jarvis: hello do you here me?')).respond(200, {success: true});
      $httpBackend.whenGET('/api?page=8&size=3&q=' + $window.encodeURIComponent('jarvis: hello do you here me?')).respond(200, {success: true});

      template = '<invenio-search search-endpoint="/api"> ' +
       '<invenio-search-pagination ' +
       'adjacent-size="4" ' +
       'template="src/invenio-search-js/templates/pagination.html"> ' +
       '</invenio-search-pagination>' +
       '</invenio-search>';

      template = $compile(template)(scope);
      scope.vm.invenioSearchResults = {
        hits: {
          total: 10
        }
      }
      scope.vm.invenioSearchArgs = {
        page: 1,
        size: 3,
        q: 'jarvis: hello do you here me?'
      };
      scope.$digest();
    })
  );

  afterEach(function() {
    $httpBackend.flush();
  });

  it('should have 4 pages', function() {
    expect(template.find('li').size()).to.be.equal(8);
  });

  it('should have two dots li items', function() {
    scope.vm.invenioSearchArgs = {
      page: 7,
      size: 3,
      q: 'jarvis: hello do you here me?'
    };
    scope.vm.invenioSearchResults = {
      hits: {
        total: 1500
      }
    };
    scope.$digest();
    expect(template.find('li').eq(10).text().trim()).to.be.equal('11');
    expect(template.find('li').eq(4).text().trim()).to.be.equal('5');
  });

  it('should have one li with dots before the last page', function() {
    scope.vm.invenioSearchResults = {
      hits: {
        total: 34
      }
    };
    scope.$digest();
    expect(template.find('li').eq(9).text().trim()).to.be.equal('8');
  });

  it('should have one li with dots before the second page', function() {
    scope.vm.invenioSearchArgs = {
      page: 8,
      size: 3,
      q: 'jarvis: hello do you here me?'
    };
    scope.vm.invenioSearchResults = {
      hits: {
        total: 30
      }
    };
    scope.$digest();
    expect(template.find('li').eq(4).text().trim()).to.be.equal('3');
  });

  it('should not have li with dots', function() {
    scope.vm.invenioSearchResults = {
      hits: {
        total: 24
      }
    };
    scope.$digest();
    expect(template.find('li').eq(4).text().trim()).to.be.equal('3');
    expect(template.find('li').eq(9).text().trim()).to.be.equal('8');
  });

  it('should return proper previous next', function() {
    scope.vm.invenioSearchArgs = {
      page: 5,
      size: 3,
      q: 'jarvis: hello do you here me?'
    };
    scope.vm.invenioSearchResults = {
      hits: {
        total: 24
      }
    };
    scope.$digest();
    expect(template.scope().paginationHelper.previous()).to.be.equal(4);
    expect(template.scope().paginationHelper.next()).to.be.equal(6);

    // if current = total should return the total
    scope.vm.invenioSearchArgs = {
      page: 8,
      size: 3,
      q: 'jarvis: hello do you here me?'
    };
    scope.$digest();
    expect(template.scope().paginationHelper.next()).to.be.equal(8);

    // if current = first should return the total
    scope.vm.invenioSearchArgs = {
      page: 1,
      size: 3,
      q: 'jarvis: hello do you here me?'
    };
    scope.$digest();
    expect(template.scope().paginationHelper.previous()).to.be.equal(1);
  });

  it('should return 0 total if results', function() {
    scope.vm.invenioSearchResults = {};
    scope.$digest();
    expect(template.scope().paginationHelper.total()).to.be.equal(0);
  });

  it('should change pages properly', function() {
    scope.vm.invenioSearchArgs = {
      page: 8,
      size: 3,
      q: 'jarvis: hello do you here me?'
    };

    // Change page to bigger than last one
    scope.paginationHelper.changePage(10);
    scope.$digest();

    expect(scope.vm.invenioSearchArgs.page).to.be.equal(4);

    // Change page to lowest than first one
    template.scope().paginationHelper.changePage(-21);
    scope.$digest();

    expect(scope.vm.invenioSearchArgs.page).to.be.equal(1);

    // Change page to normal
    scope.paginationHelper.changePage(3);
    scope.$digest();

    expect(scope.vm.invenioSearchArgs.page).to.be.equal(3);
  });

  it('should be 5th of the list', function() {
    scope.vm.invenioSearchArgs = {
      page: 7,
      size: 20,
      q: 'jarvis: hello do you here me?'
    };
    scope.vm.invenioSearchResults = {
      hits: {
        total: 226
      }
    };
    scope.$digest();
    expect(template.find('li').eq(5).text().trim()).to.be.equal('7');
  });

  it('should reset page parameter if any of args changed but page', function() {
    scope.vm.invenioSearchArgs = {
      page: 7,
      size: 20,
      q: 'jarvis: hello do you here me?'
    };
    scope.vm.invenioSearchArgs = {
      q: 'jarvis: hello??'
    };
    expect(scope.vm.invenioSearchCurrentArgs.params.page).to.be.equal(1);
  });
});
