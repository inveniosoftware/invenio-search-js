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

describe('Check searchbar directive', function() {

  var $compile,
      $rootScope;

  // Inject the angular module
  beforeEach(module('invenioSearchJs'));

  // load the templates
  beforeEach(module('src/invenio-search-js/templates/invenioSearchBar.html'));

  beforeEach(
    inject(function(_$compile_, _$rootScope_) {
      // The injector unwraps the underscores (_) from around the parameter names when matching
      $compile = _$compile_;
      $rootScope = _$rootScope_;
    })
  );

  it('creates invenio search bar directive',
    inject(function(){

      var directiveCall = '<invenio-search-bar' +
          'invenio-search-query="searching.invenioSearchQuery"' +
          'invenio-search-args="searching.invenioSearchArgs"' +
          'invenio-search-do="searching.invenioDoSearch(query)"' +
          'search-doctype=""' +
          'search-method="GET"' +
          'search-endpoint="http://localhost:9200/_search"' +
          'search-page="1"' +
          'search-size="2"' +
          'search-bar-template="src/invenio-search-js/templates/invenioSearchBar.html"' +
          'search-bar-input-placeholder="Type something"' +
          '></invenio-search-bar>';

      var element = $compile(directiveCall)($rootScope);

      // What we expect
      var expectString = 'ng-model="invenioSearchQuery"';

      // Digest the scope
      $rootScope.$digest();

      // Check
      expect(element.html()).to.equal('');
    })
  );

});
