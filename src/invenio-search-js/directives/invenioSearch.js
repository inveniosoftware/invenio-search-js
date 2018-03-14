/*
 * This file is part of Invenio.
 * Copyright (C) 2017-2018 CERN.
 *
 * Invenio is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
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
    scope.$broadcast('invenio.search.initialization', params);
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
