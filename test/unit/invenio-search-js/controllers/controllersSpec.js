/*
 * This file is part of Invenio.
 * Copyright (C) 2015, 2016 CERN.
 *
 * Invenio is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License as
 * published by the Free Software Foundation; either version 2 of the
 * License, or (at your option) any later version.
 *
 * Invenio is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Invenio; if not, write to the Free Software Foundation, Inc.,
 * 59 Temple Place, Suite 330, Boston, MA 02111-1307, USA.
 *
 * In applying this license, CERN does not
 * waive the privileges and immunities granted to it by virtue of its status
 * as an Intergovernmental Organization or submit itself to any jurisdiction.
 */

'use strict';

describe('Unit: testing controllers', function() {

  var $controller;
  var $httpBackend;
  var $rootScope;
  var ctrl;
  var scope;

  // Inject the angular module
  beforeEach(angular.mock.module('invenioSearch'));

  beforeEach(inject(function(_$httpBackend_, _$rootScope_, _$controller_) {
    $controller = _$controller_;
    $httpBackend = _$httpBackend_;
    $rootScope = _$rootScope_;

    $httpBackend.whenGET('/success?page=1&q=jarvis:+call+Hulk&size=10').respond(200, {success: true});
    $httpBackend.whenGET('/error?page=1&q=jarvis:+call+Hulk&size=10').respond(500, {success: false});
    $httpBackend.whenGET('/api?page=1&size=20').respond(200, {success: true});
    $httpBackend.whenPOST('/api?page=10&q=jarvis:+Iron+man&size=20').respond(200, {success: true});

    scope = $rootScope;
    ctrl = $controller('invenioSearchController', {
      $scope : scope,
    });

  }));

  it('should have parameters', function() {


    // The invenio search args.params.size should be 10
    expect(ctrl.invenioSearchArgs.params.size).to.be.equal(20);
    // The invenio search method should be GET
    expect(ctrl.invenioSearchArgs.method).to.be.equal('GET');

    // Scope change values
    ctrl.invenioSearchArgs.url = '/api';
    scope.$digest();
    ctrl.invenioSearchArgs.method = 'POST';
    ctrl.invenioSearchArgs.params.page = 10;
    ctrl.invenioSearchError = false;
    ctrl.invenioSearchLoading = true;
    ctrl.invenioSearchArgs.params.q = 'jarvis: Iron man';

    scope.$digest();

    ctrl.invenioSearchError = false;

    // The invenio search args.params.page should be 10
    expect(ctrl.invenioSearchArgs.params.page).to.be.equal(10);
    // The invenio search method should be POST
    expect(ctrl.invenioSearchArgs.method).to.be.equal('POST');
    // The invenio search error shoudl be true
    expect(ctrl.invenioSearchError).to.be.equal(false);
    // The invenio search loading shoudl be true
    expect(ctrl.invenioSearchLoading).to.be.equal(true);
    // The invenio search query should be Iron man
    expect(ctrl.invenioSearchArgs.params.q).to.be.equal('jarvis: Iron man');

    $httpBackend.flush();
  });

  it('should make a successful request', function() {

    // Expect a request
    $httpBackend.expectGET('/success?page=1&q=jarvis:+call+Hulk&size=10');

    ctrl.invenioSearchArgs.url = '/success';
    ctrl.invenioSearchArgs.params = {
      page: 1,
      size: 10,
      q: 'jarvis: call Hulk'
    };
    scope.$digest();
    ctrl.invenioDoSearch();
    $httpBackend.flush();
  });

  it('should make a request with error', function() {

    // Expect a request
    $httpBackend.expect('GET', '/error?page=1&q=jarvis:+call+Hulk&size=10');

    ctrl.invenioSearchArgs.url = '/error';
    ctrl.invenioSearchArgs.params = {
      page: 1,
      size: 10,
      q: 'jarvis: call Hulk'
    };

    scope.$digest();
    ctrl.invenioDoSearch();
    $httpBackend.flush();
  });

});
