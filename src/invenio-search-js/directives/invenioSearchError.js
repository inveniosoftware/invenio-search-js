/*
 * This file is part of Invenio.
 * Copyright (C) 2017-2018 CERN.
 *
 * Invenio is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

/**
  * @ngdoc directive
  * @name invenioSearchError
  * @description
  *    The invenio search results errors
  * @namespace invenioSearchError
  * @example
  *    Usage:
  *    <invenio-search-error
  *     template='TEMPLATE_PATH'>
  *        ... Any children directives
  *    </invenio-search-error>
  */
function invenioSearchError() {

  // Functions

  /**
    * Force apply the attributes to the scope
    * @memberof invenioSearchError
    * @param {service} scope -  The scope of this element.
    * @param {service} element - Element that this direcive is assigned to.
    * @param {service} attrs - Attribute of this element.
    * @param {invenioSearchController} vm - Invenio search controller.
    */
  function link(scope, element, attrs, vm) {
    scope.errorMessage = attrs.message;
  }

  /**
    * Choose template for search error
    * @memberof invenioSearchError
    * @param {service} element - Element that this direcive is assigned to.
    * @param {service} attrs - Attribute of this element.
    * @example
    *    Minimal template `template.html` usage
    *        <div ng-show='vm.invenioSearchError'>
    *            {{ errorMessage }}
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
    link: link,
  };
}

angular.module('invenioSearch.directives')
  .directive('invenioSearchError', invenioSearchError);
