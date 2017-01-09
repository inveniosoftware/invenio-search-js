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
