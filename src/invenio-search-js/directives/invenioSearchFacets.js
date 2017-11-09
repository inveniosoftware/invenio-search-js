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
  * @name invenioSearchFacets
  * @description
  *    The invenio search results facets
  * @namespace invenioSearchFacets
  * @example
  *    Usage:
  *    <invenio-search-facets
  *     order='facet1,facet2,facet3'
  *     template='TEMPLATE_PATH'>
  *        ... Any children directives
  *    </invenio-search-facets>
  */
function invenioSearchFacets() {

  // Functions

  /**
    * Handle the click on any facet
    * @memberof invenioSearchFacets
    * @param {service} scope -  The scope of this element.
    * @param {service} element - Element that this direcive is assigned to.
    * @param {service} attrs - Attribute of this element.
    * @param {invenioSearchController} vm - Invenio search controller.
    */
  function link(scope, element, attrs, vm) {
    // Make a copy of the paremeters
    scope.handler = angular.copy(
      vm.invenioSearchCurrentArgs.params
    );

    // Set the order of the facets
    if (attrs.order) {
        scope.aggOrder = attrs.order.split(',');
    }

    // Sort the aggregations if an order is specified
    orderAggregations(vm.invenioSearchResults.aggregations);

    /**
      * Handle click on the element
      * @memberof link
      * @function handleClick
      * @param {string} key - The facet key.
      * @param {string} value - The facet value.
      */
    function handleClick(key, value) {
      // Make sure it's an array
      scope.handler[key] = (scope.handler[key] === undefined) ? [] : scope.handler[key];
      if (typeof scope.handler[key] === 'string') {
        scope.handler[key] = [scope.handler[key]];
      }
      // Get the index
      var index = (scope.handler[key]).indexOf(value);
      if (index === -1) {
        // Add the value in the list
        scope.handler[key].push(value);
      } else {
        // When the params are populated from a direct link,
        // the type is a string, not a list, so splice will fail.
        if (typeof scope.handler[key] === 'string') {
          scope.handler[key] = [];
        } else {
          // Just remove it from the list
          scope.handler[key].splice(index, 1);
        }
      }
      // Update Args
      var params = {};
      params[key] = angular.copy(scope.handler[key]);
      // Make sure that we send an array
      // Update the params args
      scope.$broadcast('invenio.search.params.change', params);
    }

    /**
      * Get values from key
      * @memberof link
      * @function getValues
      * @param {string} key - The facet key.
      */
    function getValues(key) {
      return (typeof scope.handler[key] === 'string') ? [scope.handler[key]] : scope.handler[key];
    }

    /**
      * Unselect/Reset options user selected in a facet
      */
    function resetSelection(key) {
      var params = {};
      scope.handler[key] = [];
      params[key] = angular.copy(scope.handler[key]);
      // Update the params args
      scope.$broadcast('invenio.search.params.change', params);
    }

    /**
      * Return true if any of the options in a facet is selected
      */
    function isFacetSelected(key) {
      return scope.handler[key] !== undefined && scope.handler[key].length !== 0 ? true : false;
    }

    /**
      * Order the aggregations if a custom order is provided
      * @memberof link
      * @function orderAggregations
      * @param {object} aggregations - The unordered aggregations.
      */
    function orderAggregations(aggregations) {
        if (aggregations) {
            var aggKeys = scope.aggOrder || Object.keys(aggregations);
            scope.orderedAggs = aggKeys.map(function (key) {
                return {
                    key: key,
                    value: aggregations[key]
                };
            });
        }
    }

    // Listeners

    // On search finish update facets
    scope.$on('invenio.search.finished', function(evt) {
      scope.handler = angular.copy(vm.invenioSearchCurrentArgs.params);
    });

    // If the aggregations change, sort them.
    scope.$watch('vm.invenioSearchResults.aggregations', orderAggregations);

    // Assignments

    // Clicking the facets
    scope.handleClick = handleClick;
    // Return the values
    scope.getValues = getValues;
    //Reset selected facets
    scope.resetSelection = resetSelection;
    // Check if facet options are selected
    scope.isFacetSelected = isFacetSelected;
  }

  /**
    * Choose template for facets
    * @memberof invenioSearchFacets
    * @param {service} element - Element that this direcive is assigned to.
    * @param {service} attrs - Attribute of this element.
    * @example
    *    Minimal template `template.html` usage
    *     <div ng-repeat="(key, value) in vm.invenioSearchResults.aggregations track by $index">
    *       <ul class="list-unstyled" ng-repeat="item in value.buckets">
    *         <li>
    *          <input type="checkbox"
    *           ng-click="handleClick(key, item.key)" />
    *           {{ item.key }} ({{ item.doc_count }})
    *         </li>
    *       </ul>
    *     </div>
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
  .directive('invenioSearchFacets', invenioSearchFacets);
