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
  * @name invenioSearchBar
  * @description
  *    The invenioSearchBar directive
  * @namespace invenioSearchBar
  * @example
  *    Usage:
  *    <invenio-search-bar
  *     placeholder='Start typing'
  *     template='TEMPLATE_PATH'>
  *        ... Any children directives
  *    </invenio-search-bar>
  */
function invenioSearchBar() {

  // Functions

  /**
    * Force apply the attributes to the scope
    * @memberof invenioSearchBar
    * @param {service} scope -  The scope of this element.
    * @param {service} element - Element that this direcive is assigned to.
    * @param {service} attrs - Attribute of this element.
    * @param {invenioSearchController} vm - Invenio search controller.
    */
  function link(scope, element, attrs, vm) {

    /**
    * Assign the user's query to invenioSearchArgs.params.q
    * @memberof invenioSearchBar
    */
    function updateQuery() {
      vm.invenioSearchArgs.q = vm.userQuery;
    }

    scope.placeholder = attrs.placeholder;
    scope.updateQuery = updateQuery;
  }

  /**
    * Choose template for search bar
    * @memberof invenioSearchBar
    * @param {service} element - Element that this direcive is assigned to.
    * @param {service} attrs - Attribute of this element.
    * @example
    *    Minimal template `template.html` usage
    *        <input
    *          ng-model='vm.invenioSearchArgs.params.q'
    *          placeholder='{{ placeholder }}'
    *         />
    */
  function templateUrl(element, attrs) {
    return attrs.template;
  }

  ////////////

  return {
    restrict: 'AE',
    require: '^invenioSearch',
    scope: false,
    templateUrl: templateUrl,
    link: link,
  };
}

angular.module('invenioSearch.directives')
  .directive('invenioSearchBar', invenioSearchBar);
