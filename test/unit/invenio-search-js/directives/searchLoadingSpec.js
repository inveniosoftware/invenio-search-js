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

describe('Check search loading directive', function() {

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
      scope.isLoading = true;

      template = '<invenio-search-results-loading '+
        'search-loading-message="Loading" ' +
        'invenio-search-loading="isLoading" ' +
        'search-loading-template="src/invenio-search-js/templates/invenioSearchLoading.html" ' +
        '></invenio-search-results-loading>';

      template = $compile(template)(scope);
      scope.$digest();
    })
  );

  it('should have attributes', function() {
    expect(template.isolateScope().invenioSearchLoading).to.be.equal(true);
    expect(template.isolateScope().searchLoadingMessage).to.be.equal('Loading');
  });
});
