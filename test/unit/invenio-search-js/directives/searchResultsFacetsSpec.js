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

describe('Check facets directive', function() {

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

      scope.invenioSearchQuery = 'jarvis: who is Batman and Superman' +
        ' OR ' + 'batman:Batman is Bruce Wayne';

      scope.invenioSearchAggregations = {
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

      scope.doSearch = function(query) {
        scope.invenioSearchQuery = query;
      }

      template = '<invenio-search-facets ' +
        'invenio-search-items="invenioSearchAggregations.aggregations" ' +
        'invenio-search-query="invenioSearchQuery" ' +
        'invenio-search-do="doSearch(query)" ' +
        'search-facets-template="src/invenio-search-js/templates/invenioSearchFacets.html" ' +
      '></invenio-search-facets>';

      template = $compile(template)(scope);
      scope.$digest();
    })
  );

  it('should have attributes', function() {
    expect(template.isolateScope().invenioSearchItems).to.be.equal(
      scope.invenioSearchAggregations.aggregations
    );
  });

  it('should have two facets options', function() {
    expect(template.find('[type=checkbox]').length).to.be.equal(4);
    // First choice should be Batman
    expect(template.find('.panel-body').eq(0).text()).to.be.contain('Batman is Bruce Wayne');
    // First choice should be Superman
    expect(template.find('.panel-body').eq(1).text()).to.be.contain('Superman is Clark Kent');
  });

  it('should have the facet checked if is on query', function() {
    expect(template.find('[type=checkbox]').eq(0)[0].checked).to.be.equal(true);
  });

  it('should change the query when a facet selected', function() {
    // Select the second option
    template.find('[type=checkbox]').eq(1)[0].checked = true;
    // Trigger click event
    template.find('[type=checkbox]').eq(1).triggerHandler('click');
    // Check that query parsed properly
    expect(scope.invenioSearchQuery).to.be.equal(
      'jarvis: who is Batman and Superman OR batman:Batman is Bruce Wayne OR batman:Batman is Zebediah Killgrave'
    );
  });

  it('should change the query without OR when a facet deselected', function() {
    // Deselect the first option
    template.find('[type=checkbox]').eq(0)[0].checked = false;
    // Trigger click event
    template.find('[type=checkbox]').eq(0).triggerHandler('click');
    // Check that query parsed properly
    expect(scope.invenioSearchQuery).to.be.equal(
      'jarvis: who is Batman and Superman'
    );
  });

  it('should change the query with OR when a facet deselected', function() {
    scope.invenioSearchQuery = 'jarvis: who is Batman and Superman OR batman:Batman is Bruce Wayne OR superman:Superman is Magneto';
    // Digest the chage
    scope.$digest();
    // Deselect the first option
    template.find('[type=checkbox]').eq(0)[0].checked = false;
    // Trigger click event
    template.find('[type=checkbox]').eq(0).triggerHandler('click');
    // Check that query parsed properly
    expect(scope.invenioSearchQuery).to.be.equal(
      'jarvis: who is Batman and Superman OR superman:Superman is Magneto'
    );
  });
});
