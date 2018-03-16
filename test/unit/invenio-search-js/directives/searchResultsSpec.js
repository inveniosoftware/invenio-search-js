/*
 * This file is part of Invenio.
 * Copyright (C) 2015-2018 CERN.
 *
 * Invenio is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

'use strict';

describe('Check search results directive', function() {

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
      $httpBackend.whenGET('/api?gotham%20city=' + $window.encodeURIComponent('Harley Quinn') +'&metropolis=Superman').respond(200, {success: true});

      template = '<invenio-search search-endpoint="/api"> ' +
       '<invenio-search-results template="src/invenio-search-js/templates/results.html">' +
       '</invenio-search-results>' +
       '</invenio-search>';

      template = $compile(template)(scope);
      scope.$digest();

      scope.vm.invenioSearchResults = {
        links: {
          self: 'http://localhost:5000/api?page=1&size=20'
        },
        hits: {
          hits: [
            {
              metadata: {
                'control_number': 1,
                title_statement: {
                  title: 'I\'m Iron Man',
                },
              }
            },
            {
              metadata: {
                'control_number': 2,
                title_statement: {
                  title: 'I\'m Captain America'
                }
              }
            }
          ]
        }
      };
      scope.$digest();
    })
  );

  afterEach(function() {
    $httpBackend.flush();
  });

  it('should have attributes', function() {
    expect(template.scope().vm.invenioSearchResults.hits.hits.length).to.be.equal(2);
    //// Expect html list items to be 2
    expect(template.find('li').length).to.be.equal(2);
    // Expect the frist element to be Iron Man and the second Captain America
    expect(template.find('li').eq(0).text().trim()).to.be.equal('1: I\'m Iron Man');
    expect(template.find('li').eq(1).text().trim()).to.be.equal('2: I\'m Captain America');
  });

  it('should change the query from the url', inject(function($location) {
    $location.search({
      'gotham city': 'Harley Quinn',
      'metropolis': 'Superman'
    });
    scope.$digest();
    expect(scope.vm.invenioSearchArgs.metropolis).to.be.equal('Superman');
  }));
});
