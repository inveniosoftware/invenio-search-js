/*
 * This file is part of Invenio.
 * Copyright (C) 2017-2018 CERN.
 *
 * Invenio is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
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
        vm.invenioSearchSortArgs[scope.data.sortKey] ||
        scope.data.defaultSortBy || ''
      );
      if (check.charAt(0) === '-'){
        check = check.slice(1, check.length);
      }
      if (value.charAt(0) === '-'){
        value = value.slice(1, value.length);
      }
      return check === value;
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
        var value = null;
        if (newValue.charAt(0) === '-') {
          value = newValue.slice(1, newValue.length);
        } else {
          value = newValue;
        }
        if (value.length) {
          scope.data.selectedOption = value;
        }
      }
    }

    // Attach to scope
    scope.data = {
      availableOptions: JSON.parse(attrs.availableOptions || '{}'),
      selectedOption: vm.invenioSearchArgs[attrs.sortKey] || null,
      sortKey: attrs.sortKey || 'sort',
      defaultSortBy: attrs.defaultSortBy,
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
