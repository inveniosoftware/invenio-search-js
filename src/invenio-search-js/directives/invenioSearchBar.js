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
function invenioSearchBar($q, $http) {

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

    var url = attrs.suggestEndpoint || '/api/records/';

    /**
    * Suggester function to fetch suggestions from url
    * @param term - The term to search for suggestions.
    * See http://hakib.github.io/MassAutocomplete/
    */
    function suggest_state_remote(term) {
      var deferred = $q.defer();
      $http({
        method: 'GET',
        url: url,
        params: {
          q: term
        }
      }).then(function (response) {
        var results = [];
        if (response.data.hits.hits) {
          angular.forEach(response.data.hits.hits, function (value, index) {
            results.push({
              label: value.metadata.title.title,
              value: value.metadata.title.title
            });
          });
        }
        results.reverse();
        deferred.resolve(results);
      });
      return deferred.promise;
    }

    /**
    * Callback to be fired when a suggestion is selected. Triggers a new search
    * on selection.
    * @param selected - The selected suggestion item.
    * See http://hakib.github.io/MassAutocomplete/
    */
    function onSelect(selected) {
      function isEmpty(value) {
        return value === undefined ||
          value === null ||
          (typeof value === 'object' && Object.keys(value).length === 0) ||
          (typeof value === 'string' && value.trim().length === 0);
      }

      if (selected && !isEmpty(selected.value)) {
        vm.userQuery = selected.value;
        updateQuery();
      }
    }

    var suggesterEnable = attrs.suggesterEnable || false;

    if (suggesterEnable) {
      scope.autocomplete_options = angular.merge(
        attrs.autocompleteOptions || {},
        {
          suggest: suggest_state_remote,
          on_select: onSelect,
        }
      );
    }

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
  .directive('invenioSearchBar', ['$q', '$http', invenioSearchBar]);
