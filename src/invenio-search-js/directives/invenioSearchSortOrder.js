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
  * @name invenioSearchSortOrder
  * @description
  *    The invenioSearchSortOrder directive
  * @namespace invenioSearchSortOrder
  * @example
  *    Usage:
  *    <invenio-search-sort-order
  *     sort-key="sort"
  *     template='TEMPLATE_PATH'>
  *        ... Any children directives
  *    </invenio-search-sort-order>
  */
function invenioSearchSortOrder() {

  // Functions

  /**
    * Force apply the attributes to the scope
    * @memberof invenioSearchSelectBox
    * @param {service} scope -  The scope of this element.
    * @param {service} element - Element that this direcive is assigned to.
    * @param {service} attrs - Attribute of this element.
    * @param {invenioSearchController} vm - Invenio search controller.
    */
  function link(scope, element, attrs, vm) {

    /**
      * Set sort parameter
      * @param {String} key - The sort key.
      * @param {String} value - The sort value.
      * @memberof link
      */
    function setSortKey(key, value) {
      var params = {};
      params[key] = value || null;
      vm.invenioSearchArgs = angular.merge(
        vm.invenioSearchArgs, params
      );
      scope.whichOrder = (value || '').charAt(0) !== '-' ? 'asc' : 'desc';
    }

    /**
      * Handle click
      * @memberof link
      */
    function handleOrderChange() {
      // Get current sort field
      var sortfield = (
        vm.invenioSearchArgs[scope.sortKey] ||
        vm.invenioSearchCurrentArgs[scope.sortKey] ||
        this.data.selectedOption ||
        '');
      if (sortfield.charAt(0) === '-'){
        sortfield = sortfield.slice(1, sortfield.length);
      }

      // Set new sort field.
      if (scope.whichOrder === 'asc') {
        setSortKey(scope.sortKey, sortfield);
      } else if (scope.whichOrder === 'desc') {
        setSortKey(scope.sortKey, '-' + sortfield);
      }
    }

    /**
      * Handle change of sort parameter.
      * @memberof link
      */
    function onCurrentSearchChange(newValue, oldValue) {
      if(newValue) {
        scope.whichOrder = newValue.charAt(0) !== '-' ? 'asc' : 'desc';
      }
    }

    // on element click update invenioSearchArgs.params
    scope.sortKey = attrs.sortKey;
    // When scope.data has changed
    scope.handleOrderChange = handleOrderChange;
    // Check if the url has sorting option
    scope.whichOrder = 'asc';

    // Watch sort parameters
    scope.$watchCollection(
      'vm.invenioSearchSortArgs.' + scope.sortKey, onCurrentSearchChange
    );
    scope.$watchCollection(
      'vm.invenioSearchArgs.' + scope.sortKey, onCurrentSearchChange
    );
  }

  /**
    * Choose template for search loading
    * @memberof invenioSearchSelectBox
    * @param {service} element - Element that this direcive is assigned to.
    * @param {service} attrs - Attribute of this element.
    * @example
    *    Minimal template `template.html` usage
    *     <select name="select-order-{{ data.sortKey }}" ng-model="whichOrder" ng-change="handleChange()">
    *       <option value="x" ng-selected="whichOrder != '-'">asc.</option>
    *       <option value="-" ng-selected="whichOrder == '-'">desc.</option>
    *     </select>
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
  .directive('invenioSearchSortOrder', invenioSearchSortOrder);
