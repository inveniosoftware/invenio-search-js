/*
 * This file is part of Invenio.
 * Copyright (C) 2017-2018 CERN.
 *
 * Invenio is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

/**
  * @ngdoc directive
  * @name invenioSearchResults
  * @description
  *    The invenioSearchResults directive
  * @namespace invenioSearchResults
  * @example
  *    Usage:
  *    <invenio-search-results
  *     template='TEMPLATE_PATH'
  *     records-template='TEMPLATE_PATH'>
  *        ... Any children directives
  *    </invenio-search-results>
  */
function invenioSearchResults() {

  // Functions

  /**
    * Force apply the attributes to the scope
    * @memberof invenioSearchResults
    * @param {service} scope -  The scope of this element.
    * @param {service} element - Element that this direcive is assigned to.
    * @param {service} attrs - Attribute of this element.
    * @param {invenioSearchController} vm - Invenio search controller.
    */
  function link(scope, element, attrs, vm) {
    scope.recordTemplate = attrs.recordTemplate;
  }

  /**
    * Choose template for search loading
    * @memberof invenioSearchREsults
    * @param {service} element - Element that this direcive is assigned to.
    * @param {service} attrs - Attribute of this element.
    * @example
    *    Minimal template `template.html` usage
    *    <div ng-repeat="record in invenioSearchResults track by $index">
    *      <div ng-include="recordsTemplate"></div>
    *    </div>
    *
    *    Minimal `recordsTemplate`
    *    <h2>{{ record.title }}</h2>
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
  .directive('invenioSearchResults', invenioSearchResults);
