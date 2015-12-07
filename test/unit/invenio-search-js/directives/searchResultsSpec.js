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

describe('Check search results directive', function() {

  var $compile;
  var $rootScope;
  var scope;
  var template;

  // load the templates
  beforeEach(angular.mock.module('templates'));

  // Inject the angular module
  beforeEach(angular.mock.module('invenioSearchJs'));

  beforeEach(
    inject(function(_$compile_, _$rootScope_) {

      $compile = _$compile_;
      $rootScope = _$rootScope_;

      scope = $rootScope;

      scope.invenioSearchItems= [
        {
          _source: {
            title: 'I\'m Iron Man',
          }
        },
        {
          _source: {
            title: 'I\'m Captain America'
          }
        }
      ];

      template = '<invenio-search-results ' +
        'invenio-search-items="invenioSearchItems" ' +
        'search-results-template="src/invenio-search-js/templates/invenioSearchResults.html" ' +
        'search-results-record-template="src/invenio-search-js/templates/invenioSearchResultsRecord.html" ' +
      '></invenio-search-results>'

      template = $compile(template)(scope);
      scope.$digest();
    })
  );

  it('should have attributes', function() {
    expect(template.isolateScope().invenioSearchItems.length).to.be.equal(2);
    expect(template.isolateScope().invenioSearchItems.length).to.be.equal(2);
    // Expect html list items to be 2
    expect(template.find('li').size()).to.be.equal(2);
    // Expect the frist element to be Iron Man and the second Captain America
    expect(template.find('li').eq(0).text()).to.be.equal('I\'m Iron Man');
    expect(template.find('li').eq(1).text()).to.be.equal('I\'m Captain America');
  });
});
