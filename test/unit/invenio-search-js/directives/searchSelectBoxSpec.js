/*
 * This file is part of Invenio.
 * Copyright (C) 2016 CERN.
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

describe('Check search selectbox directive', function() {

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
      $httpBackend.whenGET('/api?page=1&size=20&sort=date').respond(200, {success: true});
      $httpBackend.whenGET('/api?page=1&size=20&sort=-date').respond(200, {success: true});
      $httpBackend.whenGET('/api?page=1&size=20&sort=title').respond(200, {success: true});
      $httpBackend.whenGET('/api?page=1&size=20&sort=-title').respond(200, {success: true});

      template = '<invenio-search search-endpoint="/api"> ' +
       '<invenio-search-select-box ' +
        'sort-key="sort"' +
        'available-options=\'{"options": [{"title": "Title", "value": "title"}, {"title": "Date", "value": "-date"}]}\' ' +
        'template="src/invenio-search-js/templates/selectBox.html" ' +
       '>' +
       '</invenio-search-select-box>' +
       '</invenio-search>';

      template = $compile(template)(scope);
      scope.$digest();
    })
  );

  it('should have two options in the selectbox', function() {
    expect(template.find('select').length).to.be.equal(1);
    // Select should have date as value
    expect(template.find('select').eq(0).val()).to.contain('title');
  });

  it('should have change the sort parameter to title', function() {
    template.find('select').val('title');
    // Select should have date as value
    expect(template.find('select').eq(0).val()).to.contain('title');
  });

  it('should ignore `-` infornt of sort option', function() {
    scope.vm.invenioSearchArgs['sort'] = '-title';
    scope.$digest();
    // Select should have date as value
    expect(template.find('select').eq(0).val()).to.contain('title');
  });

  it('should fallback to the default option ', function() {
    scope.vm.invenioSearchArgs['sort'] = undefined;
    scope.$digest();
    // Select should have date as value
    expect(template.find('select').eq(0).val()).to.contain('title');
  });

  it('should have select the sort value ', function() {
    scope.vm.invenioSearchArgs['sort'] = 'title';
    scope.$digest();
    // Select should have date as value
    expect(template.find('select').eq(0).val()).to.contain('title');
  });

  it('should normalize the value', function() {
    scope.vm.invenioSearchArgs['sort'] = '-date';
    scope.$digest();
    // Select should have date as value
    expect(template.find('select').eq(0).val()).to.contain('-date');
  });

});
