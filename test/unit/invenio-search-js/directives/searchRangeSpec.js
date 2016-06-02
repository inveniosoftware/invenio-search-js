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

var $compile;
var $httpBackend;
var $rootScope;
var scope;
var template;

var buckets = [{
  'doc_count': 23,
  'key': 2015,
  'key_as_string': '2015'
}, {
  'doc_count': 11,
  'key': 2017,
  'key_as_string': '2017'
}];

var beforeTests =
  function (_$compile_, _$rootScope_, _$httpBackend_) {

    $compile = _$compile_;
    $httpBackend = _$httpBackend_;
    $rootScope = _$rootScope_;

    scope = $rootScope;

    // Expect a request
    $httpBackend.whenGET(/.*/).respond(200, {
      aggregations: {
        'years': {
          'buckets': buckets
        }
      }
    });

    template = '<invenio-search search-endpoint="/api"> ' +
      '<invenio-search-range template=' +
      '"src/invenio-search-js/templates/range.html" ' +
      'options=\'{"histogramId": "#year_hist",' +
      '"selectionId": "#year_select",' +
      '"name": "years"}\'' +
      '></invenio-search-range>' +
      '</invenio-search>';

    template = $compile(template)(scope);

    var d3Select = d3.select;
    d3.select = function (elem) {
      var rv = d3Select.call(this, elem);

      if (elem == '#year_hist') {
        rv.node = function () {
          return {
            getBoundingClientRect: function () {
              return { width: 180 };
            }
          }
        }
      }

      return rv;
    };

    scope.$apply();
    document.body.insertAdjacentHTML('afterbegin', template.html());
    d3.event = {target: $('g.bar').first()[0]};

  };

var callElementHandler = function (element, handlerName) {
  var d3Element = d3.select(element)[0][0];
  d3Element[handlerName]({target: d3Element});
};

describe('Check search range factory', function () {

  sinon.stub(d3, 'mouse').returns([100, 100]);

  // load the templates
  beforeEach(module('templates'));
  // Inject the angular module
  beforeEach(module('invenioSearch'));

  beforeEach(inject(beforeTests));

  it('should have the needed elements', function () {
    expect(template.find('.panel-title').first().html()).to.equal('year');
    expect(template.find('#year_hist').length).to.be.equal(1);
    expect(template.find('#year_select').length).to.be.equal(1);
  });

  it('should have a tooltip', function () {
    scope.vm.invenioSearchArgs.q = 'hello';

    scope.$apply();
    $httpBackend.flush();

    callElementHandler('g.bar', '__onmouseenter');
    callElementHandler('g.bar', '__onmouseout');
    callElementHandler('g.bar', '__onclick');

    expect(d3.select('div.range_tooltip').length).to.be.equal(1);

  });

  it('should change the params', function () {
    var paramsSpy = sinon.spy();

    scope.vm.invenioSearchArgs['years'] = '2015--2015';

    scope.$apply();
    $httpBackend.flush();

    scope.$on('invenio.search.params.change', paramsSpy);
    callElementHandler('g.brush', '__onmousedown.brush');
    callElementHandler(window, '__onmouseup.brush');

    scope.$apply();

    expect(paramsSpy).to.have.been.called.once;
  });

  it('should call the callback on change', inject(function (invenioSearchRangeFactory) {
    var callbackSpy = sinon.spy();

    var opts = {
      margins: {},
      selectionRange: [2010, 2020]
    };

    invenioSearchRangeFactory('#year_hist', '#year_select', buckets,
      opts, callbackSpy);

    scope.$apply();

    callElementHandler('g.brush', '__onmousedown.brush');
    callElementHandler(window, '__onmouseup.brush');

    expect(callbackSpy).to.have.been.called;
  }));
});

describe('Check search range directive', function () {

  var factorySpy;

  // load the templates
  beforeEach(module('templates'));
  // load the range factory
  beforeEach(module('invenioSearch.factories'));
  // Inject the angular module
  beforeEach(module('invenioSearch'));

  beforeEach(module(function ($provide) {
    factorySpy = sinon.spy();
    $provide.value('invenioSearchRangeFactory', factorySpy);
  }));

  beforeEach(inject(beforeTests));

  it('should refresh', function () {
    scope.vm.invenioSearchArgs['years'] = '1992--2016';
    scope.vm.invenioSearchArgs.q = 'hello';
    scope.$apply();
    $httpBackend.flush();

    expect(factorySpy).to.have.been.called;
  });
});
