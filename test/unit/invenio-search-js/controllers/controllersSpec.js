/*
 * This file is part of Invenio.
 * Copyright (C) 2015-2018 CERN.
 *
 * Invenio is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

'use strict';

describe('Unit: testing controllers', function() {

  var $controller;
  var $httpBackend;
  var $rootScope;
  var ctrl;
  var scope;
  //var invenioSearchAPI;

  // Inject the angular module
  beforeEach(angular.mock.module('invenioSearch'));

  beforeEach(inject(function(_$httpBackend_, _$rootScope_, _$controller_, _invenioSearchAPI_) {
    $controller = _$controller_;
    $httpBackend = _$httpBackend_;
    $rootScope = _$rootScope_;
   // invenioSearchAPI = _invenioSearchAPI_;
    var response = {
      data: {
        link: {
          self: 'http://iron.man/?sort=-title&size=10&page=1'
        }
      }
    };
    $httpBackend.whenGET('/api?page=1&size=20').respond(200, response);
    $httpBackend.whenGET('/success?page=50&q=jarvis:+call+Hulk&size=100').respond(200, {success: true});
    $httpBackend.whenGET('/success?page=1&q=jarvis:+call+Hulk&size=10').respond(200, {success: true});
    $httpBackend.whenGET('/error?page=1&q=jarvis:+call+Hulk&size=10').respond(500, {success: false});
    $httpBackend.whenPOST('/api?page=10&q=jarvis:+Iron+man&size=20').respond(200, {success: true});

    scope = $rootScope;
    ctrl = $controller('invenioSearchCtrl', {
      $scope : scope,
      invenioSearchAPI: _invenioSearchAPI_
    });
  }));

  it('using the invenioSearchHandler', inject(function(invenioSearchHandler) {
    var data = {
      q: 'Looking for Harley Quinn.',
      a: 'Wrong Universe pal...'
    };
    // Set the data
    invenioSearchHandler.set(data);
    // Replace the url
    invenioSearchHandler.replace();
    // Get the data
    var results = invenioSearchHandler.get();
    expect(results).to.deep.equal(data);
  }));

  it('should have parameters', function() {
    // The invenio search args.size should be 10
    expect(ctrl.invenioSearchCurrentArgs.params.size).to.be.equal(20);
    // The invenio search method should be GET
    expect(ctrl.invenioSearchCurrentArgs.method).to.be.equal('GET');

    // Scope change values
    ctrl.invenioSearchArgs.url = '/api';
    //scope.$digest();
    ctrl.invenioSearchArgs.method = 'POST';
    ctrl.invenioSearchArgs.page = 10;
    ctrl.invenioSearchError = false;
    ctrl.invenioSearchLoading = true;
    ctrl.invenioSearchArgs.q = 'jarvis: Iron man';

    //scope.$digest();

    ctrl.invenioSearchError = false;

    // The invenio search args.page should be 10
    expect(ctrl.invenioSearchArgs.page).to.be.equal(10);
    // The invenio search method should be POST
    expect(ctrl.invenioSearchArgs.method).to.be.equal('POST');
    // The invenio search error shoudl be true
    expect(ctrl.invenioSearchError).to.be.equal(false);
    // The invenio search loading shoudl be true
    expect(ctrl.invenioSearchLoading).to.be.equal(true);
    // The invenio search query should be Iron man
    expect(ctrl.invenioSearchArgs.q).to.be.equal('jarvis: Iron man');
  });

  it('should make a successful request', function() {
    // Expect a request
    $httpBackend.expectGET('/success?page=1&q=jarvis:+call+Hulk&size=10');

    ctrl.invenioSearchCurrentArgs.url = '/success';
    ctrl.invenioSearchCurrentArgs.params = {
      page: 1,
      size: 10,
      q: 'jarvis: call Hulk'
    };
    ctrl.invenioDoSearch();
  });

  it('should make a request with error', function() {

    ctrl.invenioSearchCurrentArgs.url = '/error';
    ctrl.invenioSearchCurrentArgs.params = {
      page: 1,
      size: 10,
      q: 'jarvis: call Hulk'
    };

    ctrl.invenioDoSearch();
  });

  it('should parse the url', function() {
    var parsed = ctrl.parseURLQueryString(
      'http://iron.man/?sort=-title&size=20&page=2'
    );
    expect(parsed.size).to.be.equal('20');
    expect(parsed.sort).to.be.equal('-title');
  });

  it('should make a successful request without updating the url', function() {
    // Expect a request
    $httpBackend.expectGET('/success');
    // Disable url
    ctrl.disableUrlHandler = true;
    ctrl.invenioSearchCurrentArgs.url = '/success';
    ctrl.invenioSearchCurrentArgs.params = {
      page: 1,
      size: 10,
      q: 'jarvis: call Hulk'
    };
    ctrl.invenioDoSearch();
  });

  it('should force search with the url', function() {
    scope.$broadcast('invenio.search.request', {
      fight: {
        round_1: 'Jessica Jones vs Harley Quinn',
        round_2: 'Superman vs Luke',
        round_3: 'Batman vs The Punisher'
      }
    }, true);
    // Expect to be the following
    expect(ctrl.invenioSearchCurrentArgs.params.fight.round_1).to.be.equal(
      'Jessica Jones vs Harley Quinn'
    );
  });
});
