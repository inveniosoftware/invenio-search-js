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

describe('Check search pagination directive', function() {

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

      $httpBackend.whenGET('/api?page=1&size=20').respond(200, {success: true});
      $httpBackend.whenGET('/api?page=7&q=jarvis:+hello+do+you+here+me%3F&size=20').respond(200, {success: true});
      $httpBackend.whenGET('/api?page=1&q=jarvis:+hello+do+you+here+me%3F&size=3').respond(200, {success: true});
      $httpBackend.whenGET('/api?page=3&q=jarvis:+hello+do+you+here+me%3F&size=3').respond(200, {success: true});
      $httpBackend.whenGET('/api?page=4&q=jarvis:+hello+do+you+here+me%3F&size=3').respond(200, {success: true});
      $httpBackend.whenGET('/api?page=5&q=jarvis:+hello+do+you+here+me%3F&size=3').respond(200, {success: true});
      $httpBackend.whenGET('/api?page=7&q=jarvis:+hello+do+you+here+me%3F&size=3').respond(200, {success: true});
      $httpBackend.whenGET('/api?page=8&q=jarvis:+hello+do+you+here+me%3F&size=3').respond(200, {success: true});

      template = '<invenio-search search-endpoint="/api"> ' +
       '<invenio-search-pagination ' +
       'adjacent-size="4" ' +
       'template="src/invenio-search-js/templates/pagination.html"> ' +
       '</invenio-search-pagination>' +
       '</invenio-search>';

      template = $compile(template)(scope);
      scope.vm.invenioSearchResults = {
        hits: {
          total: 10
        }
      }
      scope.vm.invenioSearchArgs = {
        page: 1,
        size: 3,
        q: 'jarvis: hello do you here me?'
      };
      scope.$digest();
    })
  );

  afterEach(function() {
    $httpBackend.flush();
  });

  it('should have 4 pages', function() {
    expect(template.find('li').size()).to.be.equal(8);
  });

  it('should have two dots li items', function() {
    scope.vm.invenioSearchArgs = {
      page: 7,
      size: 3,
      q: 'jarvis: hello do you here me?'
    };
    scope.vm.invenioSearchResults = {
      hits: {
        total: 1500
      }
    };
    scope.$digest();
    expect(template.find('li').eq(10).text().trim()).to.be.equal('11');
    expect(template.find('li').eq(4).text().trim()).to.be.equal('5');
  });

  it('should have one li with dots before the last page', function() {
    scope.vm.invenioSearchResults = {
      hits: {
        total: 34
      }
    };
    scope.$digest();
    expect(template.find('li').eq(9).text().trim()).to.be.equal('8');
  });

  it('should have one li with dots before the second page', function() {
    scope.vm.invenioSearchArgs = {
      page: 8,
      size: 3,
      q: 'jarvis: hello do you here me?'
    };
    scope.vm.invenioSearchResults = {
      hits: {
        total: 30
      }
    };
    scope.$digest();
    expect(template.find('li').eq(4).text().trim()).to.be.equal('3');
  });

  it('should not have li with dots', function() {
    scope.vm.invenioSearchResults = {
      hits: {
        total: 24
      }
    };
    scope.$digest();
    expect(template.find('li').eq(4).text().trim()).to.be.equal('3');
    expect(template.find('li').eq(9).text().trim()).to.be.equal('8');
  });

  it('should return proper previous next', function() {
    scope.vm.invenioSearchArgs = {
      page: 5,
      size: 3,
      q: 'jarvis: hello do you here me?'
    };
    scope.vm.invenioSearchResults = {
      hits: {
        total: 24
      }
    };
    scope.$digest();
    expect(template.scope().paginationHelper.previous()).to.be.equal(4);
    expect(template.scope().paginationHelper.next()).to.be.equal(6);

    // if current = total should return the total
    scope.vm.invenioSearchArgs = {
      page: 8,
      size: 3,
      q: 'jarvis: hello do you here me?'
    };
    scope.$digest();
    expect(template.scope().paginationHelper.next()).to.be.equal(8);

    // if current = first should return the total
    scope.vm.invenioSearchArgs = {
      page: 1,
      size: 3,
      q: 'jarvis: hello do you here me?'
    };
    scope.$digest();
    expect(template.scope().paginationHelper.previous()).to.be.equal(1);
  });

  it('should return 0 total if results', function() {
    scope.vm.invenioSearchResults = {};
    scope.$digest();
    expect(template.scope().paginationHelper.total()).to.be.equal(0);
  });

  it('should change pages properly', function() {
    scope.vm.invenioSearchArgs = {
      page: 8,
      size: 3,
      q: 'jarvis: hello do you here me?'
    };

    // Change page to bigger than last one
    scope.paginationHelper.changePage(10);
    scope.$digest();

    expect(scope.vm.invenioSearchArgs.page).to.be.equal(4);

    // Change page to lowest than first one
    template.scope().paginationHelper.changePage(-21);
    scope.$digest();

    expect(scope.vm.invenioSearchArgs.page).to.be.equal(1);

    // Change page to normal
    scope.paginationHelper.changePage(3);
    scope.$digest();

    expect(scope.vm.invenioSearchArgs.page).to.be.equal(3);
  });

  it('should be 5th of the list', function() {
    scope.vm.invenioSearchArgs = {
      page: 7,
      size: 20,
      q: 'jarvis: hello do you here me?'
    };
    scope.vm.invenioSearchResults = {
      hits: {
        total: 226
      }
    };
    scope.$digest();
    expect(template.find('li').eq(5).text().trim()).to.be.equal('7');
  });
});
