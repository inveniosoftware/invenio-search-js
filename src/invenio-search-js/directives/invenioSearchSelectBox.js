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
  * @name invenioSearchSelectBox
  * @description
  *    The invenioSearchSelectBox directive
  * @namespace invenioSearchSelectBox
  * @example
  *    Usage:
  *    <invenio-search-select-box
  *     sort-key="sort"
  *     available-options='{
  *        "options": [
  *          {
  *            "title": "Title",
  *            "value": "title"
  *          },
  *          {
  *            "title": "Date",
  *            "value": "date"
  *          }
  *          ]}'
  *     template='TEMPLATE_PATH'>
  *        ... Any children directives
  *    </invenio-search-select-box>
  */
function invenioSearchSelectBox() {

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
      * Check if the element is selected
      * @param {String} value - The value to be checked.
      * @memberof link
      */
    function isSelected(value) {
      // Ignore if `-` character is in front of either value or check
      var check = (
        vm.invenioSearchArgs[scope.data.sortKey] ||
        vm.invenioSearchSortArgs[scope.data.sortKey] || ''
      );
      if (check.charAt(0) === '-'){
        check = check.slice(1, check.length);
      }
      if (value.charAt(0) === '-'){
        value = value.slice(1, value.length);
      }
      return  check === value || false;
    }

    function handleFieldChange(){
      // Get current sort field
      vm.invenioSearchArgs[scope.data.sortKey] = scope.data.selectedOption;
    }

    /**
      * Handle change of sort parameter.
      * @memberof link
      */
    function onCurrentSearchChange(newValue, oldValue) {
      if(newValue){
        var check = scope.data.selectedOption;
        // Normalize names
        if (check.charAt(0) === '-'){
          check = check.slice(1, check.length);
        }
        var value = null;
        if (newValue.charAt(0) === '-'){
          value = newValue.slice(1, newValue.length);
        } else {
          value = newValue;
        }
        if(check !== value){
          scope.data.selectedOption = newValue;
        }
      }
    }

    // Attach to scope
    scope.data  = {
      availableOptions: JSON.parse(attrs.availableOptions || '{}'),
      selectedOption: vm.invenioSearchArgs[attrs.sortKey] || null,
      sortKey:  attrs.sortKey || 'sort',
    };

    if(scope.data.selectedOption === null) {
      scope.data.selectedOption =
        scope.data.availableOptions.options[0].value;
    }

    // Attach the function to check if it is selected or not
    scope.isSelected = isSelected;
    scope.handleFieldChange = handleFieldChange;
    // Watch sort parameters
    scope.$watchCollection(
      'vm.invenioSearchSortArgs.' + scope.data.sortKey, onCurrentSearchChange
    );
    scope.$watchCollection(
      'vm.invenioSearchArgs.' + scope.data.sortKey, onCurrentSearchChange
    );
  }

  /**
    * Choose template for search loading
    * @memberof invenioSearchSelectBox
    * @param {service} element - Element that this direcive is assigned to.
    * @param {service} attrs - Attribute of this element.
    * @example
    *    Minimal template `template.html` usage
    *      <select ng-model="data.selectedOption">
    *        <option ng-repeat="option in data.availableOptions.options"
    *          value="{{ option.value }}"
    *          ng-selected="isSelected(option.value)"
    *        >{{ option.title }}</option>
    *      </select>
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
  .directive('invenioSearchSelectBox', invenioSearchSelectBox);
