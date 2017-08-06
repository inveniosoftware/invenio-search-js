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

describe('Check searchbar directive', function() {

  var $compile;
  var $rootScope;
  var $httpBackend;
  var scope;
  var template;

  // Load the templates
  beforeEach(angular.mock.module('templates'));

  // Inject the angular module
  beforeEach(angular.mock.module('invenioSearch'));

  beforeEach(
    inject(function(_$compile_, _$rootScope_, _$httpBackend_) {

      $compile = _$compile_;
      $httpBackend = _$httpBackend_;
      $rootScope = _$rootScope_;

      scope = $rootScope;

      template = '<invenio-search search-endpoint="/api" ' +
       'search-hidden-params=\'{"hero": "jessicajones"}\'> ' +
       '<invenio-search-bar template="src/invenio-search-js/templates/searchBar.html" ' +
       'placeholder="Type something"></invenio-search-bar>' +
       '</invenio-search>';

      var response = {
        links: {
          self: 'http://hello?size=20&page=20&sort=harleyquinn'
        }
      }

      // Expect a request
      $httpBackend.whenGET('/api?hero=jessicajones&page=1&size=20').respond(200, response);
      $httpBackend.whenGET('/api?hero=jessicajones&page=1&q=jarvis%253Acall%2520Jessica%2520Jones&size=20').respond(200, response);
      $httpBackend.whenGET('/api?hero=jessicajones&page=1&q=jarvis%253A%2520get%2520to%2520the%2520choppa&size=20').respond(200, response);

      // Compile
      template = $compile(template)(scope);
      template.scope().userQuery = 'jarvis: get to the choppa';

      scope.vm.invenioSearchCurrentArgs.params.q = 'jarvis: get to the choppa';
      // Digest
      scope.$digest();
    })
  );

  it('should have attributes', function() {
    // Expect the place holder to have value
    expect(template.scope().placeholder).to.be.equal('Type something');
  });

  it('should change the query', function() {
    // Update the input
    scope.vm.userQuery = 'jarvis:call Jessica Jones';
    template.find('input').val('jarvis:call Jessica Jones');
    template.scope().updateQuery();
    scope.$digest();

    expect(template.find('input').val()).to.be.equal(
      scope.vm.invenioSearchCurrentArgs.params.q
    );
  });

  it('should not have hidden parameters in the query', function() {
    expect(scope.vm.invenioSearchCurrentArgs.hero).to.be.undefined;
  });

  it('should have hidden parameter', function() {
    expect(scope.vm.invenioSearchHiddenParams.hero).to.be.equal('jessicajones');
  });

  it('should have saved the sortParameter form the API', function() {
    // Update the input
    scope.vm.userQuery = 'jarvis:call Jessica Jones';
    template.find('input').val('jarvis:call Jessica Jones');
    template.scope().updateQuery();
    scope.$digest();

    $httpBackend.flush();
    expect(scope.vm.invenioSearchSortArgs.sort).to.be.equal('harleyquinn');
  });

});
