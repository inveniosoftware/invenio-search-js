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

describe('Check search bar directive', function() {

  var $compile;
  var $rootScope;
  var $httpBackend;
  var scope;
  var template;

  // load the templates
  beforeEach(angular.mock.module('templates'));

  // Inject the angular module
  beforeEach(angular.mock.module('invenioSearchJs'));

  beforeEach(
    inject(function(_$compile_, _$rootScope_, _$httpBackend_) {

      $compile = _$compile_;
      $httpBackend = _$httpBackend_;
      $rootScope = _$rootScope_;

      // Expect GET requests
      $httpBackend.whenGET('*').respond({
        hits: {
          total: 2,
          hits: [
            {
              title: 'I\'m Iron Man',
            },
            {
              title: 'I\'m Captain America'
            }
          ]
        }
      });

      scope = $rootScope;

      scope.invenioSearchQuery = 'jarvis: make me a coffee';

      scope.invenioSearchArgs = {
        params: {
          page: 1,
          size: 10,
          q: scope.invenioSearchQuery
        }
      };

      scope.invenioDoSearch = function(query) {
        return query;
      };

      template = '<invenio-search-bar ' +
        'invenio-search-query="invenioSearchQuery" ' +
        'invenio-search-args="invenioSearchArgs" ' +
        'invenio-search-do="invenioDoSearch(query)" ' +
        'search-doctype="" ' +
        'search-extra-params="{}" ' +
        'search-method="GET" ' +
        'search-endpoint="/get" ' +
        'search-page="1" ' +
        'search-size="2" ' +
        'search-bar-template="src/invenio-search-js/templates/invenioSearchBar.html" ' +
        'search-bar-input-placeholder="Type something" ' +
        '></invenio-search-bar>';

      template = $compile(template)(scope);
      scope.$digest();
    })
  );

  it('should have attributes', function() {
    expect(template.isolateScope().searchPage).to.be.equal('1');
    expect(template.isolateScope().searchSize).to.be.equal('2');
    expect(template.isolateScope().invenioSearchQuery).to.be.equal('jarvis: make me a coffee');
  });

  it('should change the query', function() {
    template.find('input').val('jarvis: search');
    // Change the query
    scope.invenioSearchQuery = 'jarvis: search ultron';
    // Digest query
    scope.$digest();
    expect(template.isolateScope().invenioSearchQuery).to.be.equal('jarvis: search ultron');
  });
});
