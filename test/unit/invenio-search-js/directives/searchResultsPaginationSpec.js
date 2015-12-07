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

describe('Check search pagination directive', function() {

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


      var items = {
        hits: {
          total: 10,
          hits: [
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
          ]
        }
      };

      scope.invenioSearchItems = items;

      scope.invenioSearchQuery = 'jarvis: call black widow';

      scope.invenioSearchArgs = {
        params: {
          page: 1,
          size: 3,
          q: scope.invenioSearchQuery
        }
      };

      scope.invenioDoSearch = function(query) {
        return items;
      }

      template = '<invenio-search-results-pagination ' +
          'invenio-search-args="invenioSearchArgs" ' +
          'invenio-search-do="invenioDoSearch(query)" ' +
          'invenio-search-items="invenioSearchItems" ' +
          'invenio-search-query="invenioSearchQuery" ' +
          'search-pagination-template="src/invenio-search-js/templates/invenioSearchResultsPagination.html" ' +
        '></invenio-search-results-pagination>';

      template = $compile(template)(scope);
      scope.$digest();
    })
  );

  it('should have query', function() {
    expect(template.isolateScope().invenioSearchQuery).to.be.equal('jarvis: call black widow');
  });

  it('should have 4 pages', function() {
    expect(template.find('li').size()).to.be.equal(8);
  });

  it('should have two dots li items', function() {
    scope.invenioSearchArgs = {
      params: {
        page: 7,
        size: 3,
        q: scope.invenioSearchQuery
      }
    };
    scope.invenioSearchItems = {
      hits: {
        total: 1500
      }
    };
    scope.$digest();
    expect(template.find('li').eq(10).text().trim()).to.be.equal('..');
    expect(template.find('li').eq(4).text().trim()).to.be.equal('..');
  });

  it('should have one li with dots before the last page', function() {
    scope.invenioSearchItems = {
      hits: {
        total: 34
      }
    };
    scope.$digest()
    expect(template.find('li').eq(9).text().trim()).to.be.equal('..');
  });

  it('should have one li with dots before the second page', function() {
    scope.invenioSearchArgs = {
      params: {
        page: 8,
        size: 3,
        q: scope.invenioSearchQuery
      }
    };
    scope.invenioSearchItems = {
      hits: {
        total: 30
      }
    };
    scope.$digest()
    expect(template.find('li').eq(4).text().trim()).to.be.equal('..');
  });

  it('should not have li with dots', function() {
    scope.invenioSearchItems = {
      hits: {
        total: 24
      }
    };
    scope.$digest()
    expect(template.find('li').eq(4).text().trim()).to.be.equal('3');
    expect(template.find('li').eq(9).text().trim()).to.be.equal('8');
  });

  it('should return proper previous next', function() {
    scope.invenioSearchArgs = {
      params: {
        page: 5,
        size: 3,
        q: scope.invenioSearchQuery
      }
    };
    scope.invenioSearchItems = {
      hits: {
        total: 24
      }
    };
    scope.$digest()
    expect(template.isolateScope().paginationHelper.previous()).to.be.equal(4);
    expect(template.isolateScope().paginationHelper.next()).to.be.equal(6);

    // if current = total should return the total
    scope.invenioSearchArgs = {
      params: {
        page: 8,
        size: 3,
        q: scope.invenioSearchQuery
      }
    };
    scope.$digest()
    expect(template.isolateScope().paginationHelper.next()).to.be.equal(8);

    // if current = first should return the total
    scope.invenioSearchArgs = {
      params: {
        page: 1,
        size: 3,
        q: scope.invenioSearchQuery
      }
    };
    scope.$digest()
    expect(template.isolateScope().paginationHelper.previous()).to.be.equal(1);
  });

  it('should return 0 total if results', function() {
    scope.invenioSearchItems = {};
    scope.$digest()
    expect(template.isolateScope().paginationHelper.total()).to.be.equal(0);
  });

  it('should change pages properly', function() {
    scope.invenioSearchArgs = {
      params: {
        page: 8,
        size: 3,
        q: scope.invenioSearchQuery
      }
    };

    // Change page to bigger than last one
    template.isolateScope().paginationHelper.changePage(10);
    scope.$digest()

    expect(template.isolateScope().invenioSearchArgs.params.page).to.be.equal(8);

    // Change page to lowest than first one
    template.isolateScope().paginationHelper.changePage(-21);
    scope.$digest()

    expect(template.isolateScope().invenioSearchArgs.params.page).to.be.equal(1);

    // Change page to normal
    template.isolateScope().paginationHelper.changePage(3);
    scope.$digest()

    expect(template.isolateScope().invenioSearchArgs.params.page).to.be.equal(3);
  });
});
