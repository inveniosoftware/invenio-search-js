/*
 * This file is part of Invenio.
 * Copyright (C) 2017-2018 CERN.
 *
 * Invenio is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

/**
  * @ngdoc directive
  * @name invenioSearchLoading
  * @description
  *    The invenioSearchLoading directive
  * @namespace invenioSearchLoading
  * @example
  *    Usage:
  *    <invenio-search-loading
  *     message='{{ _('Loading') }}'
  *     template='TEMPLATE_PATH'>
  *        ... Any children directives
  *    </invenio-search-loading>
  */
function invenioSearchLoading() {

  // Functions

  /**
    * Force apply the attributes to the scope
    * @memberof invenioSearchLoading
    * @param {service} scope -  The scope of this element.
    * @param {service} element - Element that this direcive is assigned to.
    * @param {service} attrs - Attribute of this element.
    * @param {invenioSearchController} vm - Invenio search controller.
    */
  function link(scope, element, attrs, vm) {
    scope.loadingMessage = attrs.message;
  }

  /**
    * Choose template for search loading
    * @memberof invenioSearchLoading
    * @param {service} element - Element that this direcive is assigned to.
    * @param {service} attrs - Attribute of this element.
    * @example
    *    Minimal template `template.html` usage
    *        <div ng-show='vm.invenioSearchLoading'>
    *          <i class='fa fa-loading'></i> {{ loadingMessage }}
    *        </div>
    */
  function templateUrl(element, attrs) {
    return attrs.template;
  }

  ////////////

  return {
    restrict: 'AE',
    require: '^invenioSearch',
    templateUrl: templateUrl,
    link: link,
  };
}

angular.module('invenioSearch.directives')
  .directive('invenioSearchLoading', invenioSearchLoading);
