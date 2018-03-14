/*
 * This file is part of Invenio.
 * Copyright (C) 2017-2018 CERN.
 *
 * Invenio is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

/**
  * @ngdoc directive
  * @name invenioSearchCount
  * @description
  *    The invenio search results count
  * @namespace invenioSearchCount
  * @example
  *    Usage:
  *    <invenio-search-count
  *     template='TEMPLATE_PATH'>
  *        ... Any children directives
  *    </invenio-search-count>
  */
function invenioSearchCount() {

  // Functions

  /**
    * Choose template for search count
    * @memberof invenioSearchCount
    * @param {service} element - Element that this direcive is assigned to.
    * @param {service} attrs - Attribute of this element.
    * @example
    *    Minimal template `template.html` usage
    *        <div ng-show='vm.invenioSearchResults.length > 0'>
    *          {{ vm.invenioSearchResults.length }} records.
    *        </div>
    */
  function templateUrl(element, attrs) {
    return attrs.template;
  }

  ////////////

  return {
    restrict: 'AE',
    scope: false,
    require: '^invenioSearch',
    templateUrl: templateUrl,
  };
}

angular.module('invenioSearch.directives')
  .directive('invenioSearchCount', invenioSearchCount);
