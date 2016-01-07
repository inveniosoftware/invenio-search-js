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

describe('Check search count directive', function() {

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

      template = '<invenio-search search-endpoint="/api"> ' +
       '<invenio-search-count template="src/invenio-search-js/templates/count.html">' +
       '</invenio-search-count>' +
       '</invenio-search>';

      // Expect a request
      $httpBackend.whenGET('/api?page=1&size=20').respond(200, {success: true});

      template = $compile(template)(scope);
      scope.$digest();
    })
  );

  it('should have attributes', function() {
    // 10 results
    scope.vm.invenioSearchResults = {
      hits: {
        total: 10
      }
    };
    scope.$digest();
    expect(template.find('div').text().trim()).to.contain('10 records found.');

    // 1 result
    scope.vm.invenioSearchResults = {
      hits: {
        total: 1
      }
    };
    scope.$digest();
    expect(template.find('div').text().trim()).to.contain('1 record found.');
    // no results
    scope.vm.invenioSearchResults = {
      hits: {
        total: 0
      }
    };
    scope.$digest();
    expect(template.find('div').text().trim()).to.contain('No results.');
  });
});
