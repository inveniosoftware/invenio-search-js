/*
 * This file is part of Invenio.
 * Copyright (C) 2017 CERN.
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

/**
  * @ngdoc directive
  * @name invenioSearch
  * @description
  *    The invenioSearch directive handler
  * @namespace invenioSearch
  * @example
  *    Usage:
  *    <invenio-search
  *     search-endpoint='SEARCH_PROVIDER_URL'
  *     search-headers='{"Accept": "application/json"}'
  *     search-hidden-params='{"collection": "Collection"}'
  *     search-extra-params='{"page": 2, "size": 5}'>
  *        ... Any children directives
  *    </invenio-search>
  */
function invenioSearch() {

  // Functions

  /**
    * Initialize search
    * @memberof invenioSearch
    * @param {service} scope -  The scope of this element.
    * @param {service} element - Element that this direcive is assigned to.
    * @param {service} attrs - Attribute of this element.
    * @param {invenioSearchCtrl} vm - Invenio search controller.
    */
  function link(scope, element, attrs, vm) {
    // Update search parameters
    var collectedArgs = {
      url: attrs.searchEndpoint,
      method: attrs.searchMethod || 'GET',
      headers: JSON.parse(attrs.searchHeaders || '{}'),
    };

    // Add any extra parameters
    var extraParams = {
      params: JSON.parse(attrs.searchExtraParams || '{}')
    };

    var urlParams = {
      params: vm.invenioSearchGetUrlArgs()
    };

    // Url listerner
    vm.disableUrlHandler = (attrs.disableUrlHandler) ? true : false;

    vm.invenioSearchHiddenParams = JSON.parse(
      attrs.searchHiddenParams  || '{}'
    );

    // Update arguments
    var params = angular.merge(
      {},
      collectedArgs,
      extraParams,
      urlParams
    );

    // Brodcast ready to initialization
    scope.$broadcast('invenio.search.initialazation', params);
  }

  ////////////

  return {
    restrict: 'AE',
    scope: false,
    controller: 'invenioSearchCtrl',
    controllerAs: 'vm',
    link: link,
  };
}

angular.module('invenioSearch.directives')
  .directive('invenioSearch', invenioSearch);
