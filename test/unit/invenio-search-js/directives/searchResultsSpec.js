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

describe('Check search results directive', function() {

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

      template = '<invenio-search search-endpoint="/api"> ' +
       '<invenio-search-results template="src/invenio-search-js/templates/results.html">' +
       '</invenio-search-results>' +
       '</invenio-search>';

      template = $compile(template)(scope);
      scope.$digest();

      scope.vm.invenioSearchResults = {
        hits: {
          hits: [
            {
              _source: {
                title_statement: {
                  title: 'I\'m Iron Man',
                },
              }
            },
            {
              _source: {
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
    expect(template.find('li').size()).to.be.equal(2);
    // Expect the frist element to be Iron Man and the second Captain America
    expect(template.find('li').eq(0).text().trim()).to.be.equal('I\'m Iron Man');
    expect(template.find('li').eq(1).text().trim()).to.be.equal('I\'m Captain America');
  });
});
