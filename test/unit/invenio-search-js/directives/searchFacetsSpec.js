/*
 * This file is part of Invenio.
 * Copyright (C) 2015-2018 CERN.
 *
 * Invenio is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

'use strict';

describe('Check search facets directive', function() {

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
      // Expect a request
      $httpBackend.whenGET('/api?page=1&size=20').respond(200, {success: true});
      $httpBackend.whenGET('/api?page=1&size=20&superman=' + $window.encodeURIComponent('Superman is Clark Kent')).respond(200, {success: true});
      $httpBackend.whenGET('/api?page=1&size=20&superman=' + $window.encodeURIComponent('Superman is Magneto')).respond(200, {success: true});
      $httpBackend.whenGET('/api?page=1&size=20&q=jarvis&batman=' + $window.encodeURIComponent('Batman is Bruce Wayne')).respond(200, {success: true});
      $httpBackend.whenGET('/api?page=1&size=20&superman=' + $window.encodeURIComponent('Superman is Clark Kent') + '&superman=' + $window.encodeURIComponent('Superman is Magneto')).respond(200, {success: true});
      $httpBackend.whenGET('/api?page=1&size=20&q=jarvis&batman=' + $window.encodeURIComponent('Batman is Bruce Wayne') + '&superman=' + $window.encodeURIComponent('Superman is Clark Kent') + '&superman=' + $window.encodeURIComponent('Superman is Magneto')).respond(200, {success: true});
      $httpBackend.whenGET('/api?page=1&size=20&q=jarvis&superman=' + $window.encodeURIComponent('Superman is Clark Kent') + '&superman=' + $window.encodeURIComponent('Superman is Magneto')).respond(200, {success: true});
      $httpBackend.whenGET('/api?page=1&size=20&q=jarvis&batman=' + $window.encodeURIComponent('Batman is Bruce Wayne') + '&superman=' + $window.encodeURIComponent('Superman is Clark Kent')).respond(200, {success: true});
      $httpBackend.whenGET('/api?page=1&size=20&q=jarvis&batman=' + $window.encodeURIComponent('Batman is Bruce Wayne') + '&superman=' + $window.encodeURIComponent('Superman is Magneto')).respond(200, {success: true});

      template = '<invenio-search search-endpoint="/api"> ' +
       '<invenio-search-facets template="src/invenio-search-js/templates/facets.html">' +
       '</invenio-search-facets>' +
       '</invenio-search>';

      template = $compile(template)(scope);
      scope.vm.invenioSearchArgs.q = 'jarvis';
      scope.vm.invenioSearchArgs.batman = 'Batman is Bruce Wayne';
      scope.$digest();

      scope.vm.invenioSearchResults = {
        aggregations: {
          batman: {
            buckets: [
              {
                key: 'Batman is Bruce Wayne',
                doc_count: 100
              },
              {
                key: 'Batman is Zebediah Killgrave',
                doc_count: 10
              }
            ]
          },
          superman: {
            buckets: [
              {
                key: 'Superman is Clark Kent',
                doc_count: 100
              },
              {
                key: 'Superman is Magneto',
                doc_count: 10
              }
            ]
          }
        }
      };
      scope.$digest();
    })
  );

  afterEach(function() {
    $httpBackend.flush();
  });

  it('should have two facets options', function() {
    expect(template.find('[type=checkbox]').length).to.be.equal(4);
    // First choice should be Batman
    expect(template.find('.panel-body').eq(0).text()).to.contain('Batman is Bruce Wayne');
    // Second choice should be Superman
    expect(template.find('.panel-body').eq(1).text()).to.contain('Superman is Clark Kent');
  });

  it('should have the facet checked if is on query', inject(function($timeout) {
    // Select the third and forth option option
    template.find('[type=checkbox]').eq(2)[0].checked = true;
    template.find('[type=checkbox]').eq(3)[0].checked = true;
    template.find('[type=checkbox]').eq(2).triggerHandler('click');
    template.find('[type=checkbox]').eq(3).triggerHandler('click');
    expect(template.find('[type=checkbox]').eq(2)[0].checked).to.be.equal(true);
    expect(template.find('[type=checkbox]').eq(3)[0].checked).to.be.equal(true);

    // See if the parameters have been updated
    expect(scope.vm.invenioSearchArgs.superman[0]).to.be.equal('Superman is Clark Kent');
    expect(scope.vm.invenioSearchArgs.superman[1]).to.be.equal('Superman is Magneto');
    expect(scope.vm.invenioSearchArgs.superman.length).to.be.equal(2);

    // Now uncheck and see again
    template.find('[type=checkbox]').eq(2)[0].checked = false;
    template.find('[type=checkbox]').eq(2).triggerHandler('click');
    expect(template.find('[type=checkbox]').eq(2)[0].checked).to.be.equal(false);
    expect(scope.vm.invenioSearchArgs.superman.length).to.be.equal(1);
  }));

  it('should sort the options by the order attribute', inject(function($timeout) {
    // Normal order - First choice should be Batman
    expect(template.find('.panel-title').eq(0).text()).to.be.equal('batman');
    // Normal order - Second choice should be Superman
    expect(template.find('.panel-title').eq(1).text()).to.be.equal('superman');

    template = '<invenio-search search-endpoint="/api"> ' +
     '<invenio-search-facets ' +
     'order="superman,batman"' +
     'template="src/invenio-search-js/templates/facets.html">' +
     '</invenio-search-facets>' +
     '</invenio-search>';

    var searchResults = scope.vm.invenioSearchResults;
    template = $compile(template)(scope);
    scope.vm.invenioSearchResults = searchResults;
    scope.$digest();

    // Custom order - First choice should be Superman
    expect(template.find('.panel-title').eq(0).text()).to.be.equal('superman');
    // Custom order - Second choice should be Batman
    expect(template.find('.panel-title').eq(1).text()).to.be.equal('batman');
  }));
});
