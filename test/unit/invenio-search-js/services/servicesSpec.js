/*
 * This file is part of Invenio.
 * Copyright (C) 2015 CERN.
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

describe('Unit: testing services', function() {

  // Request object
  var API;
  var $httpBackend;

  // Inject the angular module
  beforeEach(angular.mock.module('invenioSearchJs'));

  beforeEach(
    inject(function(invenioSearchAPI, _$httpBackend_) {
      $httpBackend = _$httpBackend_;
      API = invenioSearchAPI;
      $httpBackend.whenGET('/success?page=1&q=jarvis:+call+Hulk&size=10').respond(200, {'success': true});
      $httpBackend.whenGET('/error?page=1&q=jarvis:+call+Hulk&size=10').respond(500, {'success': false});
    })
  );

  it('should have a success response', function(done) {
    var args = {
      method: 'GET',
      url: '/success',
      params: {
        page: 1,
        size: 10,
        q: 'jarvis: call Hulk'
      }
    };
    $httpBackend.expectGET('/success?page=1&q=jarvis:+call+Hulk&size=10');
    API.search(args).then(function(data) {
      expect(data.data.success).to.be.equal(true);
      done();
    });
    $httpBackend.flush();
  });

  it('should have an error response', function(done) {
    var args = {
      method: 'GET',
      url: '/error',
      params: {
        page: 1,
        size: 10,
        q: 'jarvis: call Hulk'
      }
    };

    $httpBackend.expectGET('/success?page=1&q=jarvis:+call+Hulk&size=10');
    API.search(args).then(
      function(data) {},
      function(error){
        expect(error.data.success).to.be.equal(false);
        done();
      }
    );
    $httpBackend.flush();
  });

});
