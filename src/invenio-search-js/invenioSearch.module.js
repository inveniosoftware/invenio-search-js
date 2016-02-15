/*
 * This file is part of Invenio.
 * Copyright (C) 2015, 2016 CERN.
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

(function (angular) {
  // Controllers

  /**
   * @ngdoc controller
   * @name invenioSearchController
   * @namespace invenioSearchController
   * @description
   *    Invenio search controller.
   */
  function invenioSearchController($scope, invenioSearchHandler, invenioSearchAPI) {

    // Assign controller to `vm`
    var vm = this;

    // Parameters

    // Initialize search resutls
    vm.invenioSearchResults = {};

    // Search Loading - if invenioSearch has the state loading
    vm.invenioSearchLoading = true;

    // Search Error - if invenioSearch has the state error
    vm.invenioSearchError = {};

    // Search Query Args - invenioSearch query arguments
    vm.invenioSearchArgs = {
      method: 'GET',
      params: {
        page: 1,
        size: 20,
      }
    };

    // Search URL arguments
    // Get
    vm.invenioSearchGetUrlArgs = invenioSearchGetUrlArgs;
    // Set
    vm.invenioSearchSetUrlArgs = invenioSearchSetUrlArgs;

    // Invenio Do Search
    vm.invenioDoSearch = invenioDoSearch;

    ////////////

    // Functions

    /**
     * Get url parameters.
     * @memberof invenioSearchController
     * @function invenioSearchGetUrlArgs
     * @returnis {Object} The url parameters.
     */
    function invenioSearchGetUrlArgs() {
      return invenioSearchHandler.get();
    }

    /**
     * Set url parameters.
     * @memberof invenioSearchController
     * @function invenioSearchSetUrlArgs
     * @param {Object} newParameters - The new search parameters.
     * @param {Object} currentParameters - The current search response.
     */
    function invenioSearchSetUrlArgs(newParameters, currentParameters) {
      // If the page haven't changed make sure that we are back to page 1
      if (newParameters !== undefined) {
        if (newParameters.q !== currentParameters.q) {
          vm.invenioSearchArgs.params.page = 1;
        }
      }

      // Broadcast url changed
      $scope.$broadcast('invenio.search.url.changed');

      // Update the userQuery with the latest
      vm.userQuery = vm.invenioSearchArgs.params.q;
      // Set the new url
      invenioSearchHandler.set(vm.invenioSearchArgs.params);
    }

    /**
     * Do the search
     * @memberof invenioSearchController
     * @function invenioDoSearch
     */
    function invenioDoSearch() {
      // Broadcast search requested
      $scope.$broadcast('invenio.search.requested');

      // Set state to loading
      vm.invenioSearchLoading = true;
      // Clear any previous errors
      vm.invenioSearchError = {};

      /**
       * After the request finish proccesses
       * @memberof invenioDoSearch
       * @function clearRequest
       */
      function clearRequest() {
        vm.invenioSearchLoading = false;
        // Broadcast the search finished
        $scope.$broadcast('invenio.search.finished');
      }

      /**
       * After a successful request
       * @memberof invenioDoSearch
       * @function successfulRequest
       * @param {Object} response - The search request response.
       */
      function successfulRequest(response) {
        // Broadcast the success
        $scope.$broadcast('invenio.search.success');
        // Assign the new data
        vm.invenioSearchResults = response.data;
      }

      /**
       * After an errored request
       * @memberof invenioDoSearch
       * @function erroredRequest
       * @param {Object} error - The search request response.
       */
      function erroredRequest(error) {
        // Set results to none
        vm.invenioSearchResults = {};
        // Broadcast the error
        $scope.$broadcast('invenio.search.error', error);
      }

      invenioSearchAPI
        .search(vm.invenioSearchArgs, vm.invenioSearchHiddenParams)
        .then(successfulRequest, erroredRequest)
        .finally(clearRequest);
    }

    /**
     * Merge `invenioSearchArgs` with updated parameters
     * @memberof invenioSearchController
     * @function invenioSearchLocationChange
     * @param {Object} $event - The event object.
     * @param {Object} nextUrl - The new url value.
     * @param {Object} currentUrl - The current url value.
     */
    function invenioSearchLocationChange($event, nextUrl, currentUrl) {
      if (!angular.equals(nextUrl, currentUrl)) {
        // Get the parameters
        var parameters = {
          params: vm.invenioSearchGetUrlArgs()
        };

        // Merge the parameters with the current `invenioSearchArgs`
        vm.invenioSearchArgs = angular.merge(
          vm.invenioSearchArgs,
          parameters
        );
      }
      // Do the action search
      vm.invenioDoSearch();
    }


    /**
     * Proccess a search error
     * @memberof invenioSearchController
     * @function invenioSearchErrorHandler
     * @param {Object} error - The error trace.
     */
    function invenioSearchErrorHandler(error) {
      // Set the new error
      vm.invenioSearchError = error;
    }

    ////////////

    // Listeners

    // When URL parameters changed
    $scope.$on('$locationChangeStart', invenioSearchLocationChange);
    // When the search errored
    $scope.$on('invenio.search.error', invenioSearchErrorHandler);
    // When invenioSearchArgs.params has changed
    $scope.$watchCollection(
      'vm.invenioSearchArgs.params', vm.invenioSearchSetUrlArgs
    );

    ////////////

  }

  invenioSearchController.$inject = [
    '$scope', 'invenioSearchHandler', 'invenioSearchAPI'
  ];

  ////////////

  // Directives

  /**
   * @ngdoc directive
   * @name invenioSearch
   * @description
   *    The invenioSearch directive handler
   * @namespace invenioSearch
   * @example
   *    Usage:
   *    <invenio-search
   *     search-endpoint='SEARCH_PROVIDER_URL'
   *     search-hidden-params='{"collection": "Collection"}'>
   *     search-extra-params='{"page": 2, "size": 5}'>
   *        ... Any children directives
   *    </invenio-search>
   */
  function invenioSearch() {

    // Functions

    /**
     * Initialize search
     * @memberof invenioSearch
     * @param {service} scope -  The scope of this element.
     * @param {service} element - Element that this direcive is assigned to.
     * @param {service} attrs - Attribute of this element.
     * @param {invenioSearchController} vm - Invenio search controller.
     */
    function link(scope, element, attrs, vm) {
      // Update search parameters
      var collectedArgs = {
        url: attrs.searchEndpoint,
        method: attrs.searchMethod || 'GET',
      };

      // Add any extra parameters
      var extraParams = {
        params: JSON.parse(attrs.searchExtraParams || '{}')
      };

      var urlParams = {
        params: vm.invenioSearchGetUrlArgs()
      };

      vm.invenioSearchHiddenParams = JSON.parse(
        attrs.searchHiddenParams  || '{}'
      );

      // Update arguments
      vm.invenioSearchArgs = angular.merge(
        vm.invenioSearchArgs,
        collectedArgs,
        extraParams,
        urlParams
      );
    }

    ////////////

    return {
      restrict: 'AE',
      scope: false,
      controller: 'invenioSearchController',
      controllerAs: 'vm',
      link: link,
    };
  }

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
        vm.invenioSearchArgs.params.q = vm.userQuery;
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

  /**
   * @ngdoc directive
   * @name invenioSearchCount
   * @description
   *    The invenio search results count
   * @namespace invenioSearchCount
   * @example
   *    Usage:
   *    <invenio-search-count
   *     template='TEMPLATE_PATH'>
   *        ... Any children directives
   *    </invenio-search-count>
   */
  function invenioSearchCount() {

    // Functions

    /**
     * Choose template for search count
     * @memberof invenioSearchCount
     * @param {service} element - Element that this direcive is assigned to.
     * @param {service} attrs - Attribute of this element.
     * @example
     *    Minimal template `template.html` usage
     *        <div ng-show='vm.invenioSearchResults.length > 0'>
     *          {{ vm.invenioSearchResults.length }} records.
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
    };
  }

  /**
   * @ngdoc directive
   * @name invenioSearchFacets
   * @description
   *    The invenio search results facets
   * @namespace invenioSearchFacets
   * @example
   *    Usage:
   *    <invenio-search-facets
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

      /**
       * Handle click on the element
       * @memberof link
       */
      function handleClick(key, value) {
        var current = vm.invenioSearchArgs.params[key] || [];
        // Make sure it's an object
        current = (typeof current === 'string') ? [current] : current;

        // Reset parameters
        vm.invenioSearchArgs.params[key] = [];

        if (current.indexOf(value) === -1) {
          // Add the value in the list
          current.push(value);
        } else {
          // Just remove it from the list
          current.splice(current.indexOf(value), 1);
        }

        // Preapare object for merge
        var params = {};
        params[key] = current;
        vm.invenioSearchArgs.params = angular.merge(
          vm.invenioSearchArgs.params, params
        );
      }
      scope.handleClick = handleClick;
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

  /**
   * @ngdoc directive
   * @name invenioSearchPagination
   * @description
   *   The pagination directive for search
   * @namespace invenioSearchPagination
   * @example
   *    Usage:
   *    <invenio-search-pagination
   *     show-go-to-first-last='true'
   *     adjacent-size='4'
   *     template='TEMPLATE_PATH'>
   *        ... Any children directives
   *    </invenio-search-pagination>
   */
  function invenioSearchPagination() {
    // Functions

    /**
     * Handle pagination
     * @memberof invenioSearchPagination
     * @param {service} scope -  The scope of this element.
     * @param {service} element - Element that this direcive is assigned to.
     * @param {service} attrs - Attribute of this element.
     * @param {invenioSearchController} vm - Invenio search controller.
     */
    function link(scope, element, attrs, vm) {
       // Watch when `invenioSearchArgs` changes and fire a new search
      scope.paginatePages = [];
      scope.adjacentSize = attrs.adjacentSize || 4;
      scope.showGoToFirstLast = attrs.showGoToFirstLast || false;

      scope.$watch('vm.invenioSearchArgs.params.page', function(current, next) {
        if (current !== next) {
          buildPages();
        }
      });

      scope.$watch('vm.invenioSearchResults', function(current, next) {
        buildPages();
      });

      /**
       * Add range number for magination
       * @memberof link
       * @param {int} start - The start of the range.
       * @param {int} finish - The end of the range.
       */
      function addRange(start, finish) {
        // Create the Add Item Function
        var _current = current();

        var buildItem = function (i) {
          return {
            value: i,
            title: 'Go to page ' + i,
          };
        };

        // Add our items where i is the page number
        for (var i = start; i <= finish; i++) {
          var item = buildItem(i);
          scope.paginatePages.push(item);
        }
      }

      /**
       * Calculate the numbers
       * @memberof link
       */
      function buildPages() {
        // Reset pages
        scope.paginatePages = [];
        // How many neighbours to show before and after the current page
        var adjacent = scope.adjacentSize;
        // Get total pages based on the results shown by page
        var pageCount = total();
        // Get the current page
        var _current = current();
        // Display the adjacent a1 a2 a3 + current + a5 a6 a7
        var adjacentSize = (2 * adjacent);

        // Pages to show in the pagination
        var start, finish;
        // Simply display all the pages
        if (pageCount <= (adjacentSize + 2)) {
          start = 1;
          addRange(start, pageCount);
        } else {
          if (_current - adjacent <= 2) {
            start = 1;
            finish = 1 + adjacentSize;
            addRange(start, finish);
          } else if (_current < pageCount - (adjacent + 2)) {
            start = _current - adjacent;
            finish = _current + adjacent;
            addRange(start, finish);
          } else {
            start = pageCount - adjacentSize;
            finish = pageCount;
            addRange(start, finish);
          }
        }
      }

      /**
       * Calculate the total pages
       * @memberof link
       */
      function total() {
        var _total;
        try {
          _total = vm.invenioSearchResults.hits.total;
        } catch (error) {
          _total = 0;
        }
        return Math.ceil(_total/vm.invenioSearchArgs.params.size);
      }

      /**
       * Calculate the current page
       * @memberof link
       */
      function current() {
        return parseInt(vm.invenioSearchArgs.params.page) || 1;
      }

      /**
       * Calculate the next page
       * @memberof link
       */
      function next() {
        var _next = current();
        var _total = total();
        if (_next < _total) {
          _next = _next + 1;
        }
        return _next;
      }

      /**
       * Calculate the previous page
       * @memberof link
       */
      function previous() {
        var _previous = current();
        var _total = total();
        if (_previous > 1) {
          _previous = _previous - 1;
        }
        return _previous;
      }

      /**
       * Calculate page class if it is active or not
       * @memberof link
       * @param {int} index - A given page of the array.
       */
      function getPageClass(index) {
        return index === current() ? 'active' : '';
      }

      /**
       * Calculate the next arrow if it is active or not
       * @memberof link
       */
      function getNextClass() {
        return current() < total() ? '' : 'disabled';
      }

      /**
       * Calculate the previous arrow if it is active or not
       * @memberof link
       */
      function getPrevClass() {
        return current() > 1 ? '' : 'disabled';
      }

      /**
       * Calculate the go to first if it is active or not
       * @memberof link
       */
      function getFirstClass() {
        return current() !== 1 ? '' : 'disabled';
      }

      /**
       * Calculate the go to last if it is active or not
       * @memberof link
       */
      function getLastClass() {
        return current() !== total() ? '' : 'disabled';
      }

      /**
       * Change page to the given index
       * @memberof link
       * @param {int} index - A given page of the array.
       */
      function changePage(index) {
        if (index > total()) {
          vm.invenioSearchArgs.params.page = total();
        } else if ( index < 1) {
          vm.invenioSearchArgs.params.page = 1;
        } else {
          vm.invenioSearchArgs.params.page = index;
        }
      }

      // Pages calculator
      scope.paginationHelper = {
        changePage: changePage,
        current: current,
        getFirstClass: getFirstClass,
        getLastClass: getLastClass,
        getNextClass: getNextClass,
        getPageClass: getPageClass,
        getPrevClass: getPrevClass,
        next: next,
        pages: buildPages,
        previous: previous,
        total: total,
      };
    }

    /**
     * Choose template for pagination
     * @memberof invenioSearchPagination
     * @param {service} element - Element that this direcive is assigned to.
     * @param {service} attrs - Attribute of this element.
     * @example
     *    Minimal template `template.html` usage
     *      <ul class="pagination" ng-if="vm.invenioSearchResults.hits.total">
     *        <li ng-class="paginationHelper.getPageClass(page.value)"
     *            ng-repeat="page in paginatePages">
     *          <a href="#" ng-click="paginationHelper.changePage(page.value)"
     *             alt="{{ page.title }}">{{ page.value }}</a>
     *        </li>
     *      </ul>
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
   *     default-option="date"
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
       * Set sort parameter
       * @param {String} key - The sort key.
       * @param {String} value - The sort value.
       * @memberof link
       */
      function setSortKey(key, value) {
        var params = {};
        params[key] = value || null;
        vm.invenioSearchArgs.params = angular.merge(
          vm.invenioSearchArgs.params, params
        );
      }

      /**
       * Handle select box on change the element
       * @param {String} newValue - The new sort value.
       * @param {String} oldValue - The current soert value.
       * @memberof link
       */
      function onChange(newValue, oldValue) {
        // Check if is passed from parameters url
        setSortKey(
          scope.data.sortKey, scope.data.selectedOption
        );
      }

      /**
       * Check if the element is selected
       * @param {String} value - The value to be checked.
       * @memberof link
       */
      function isSelected(value) {
        // Ignore if `-` character is infront
        var check = vm.invenioSearchArgs.params[scope.data.sortKey] || '';
        if (check.indexOf('-') > -1){
          check = check.slice(1, check.length);
        }
        return  check === value || false;
      }

      // Attach to scope
      scope.data  = {
        availableOptions: JSON.parse(attrs.availableOptions || '{}'),
        defaultOption: attrs.defaultOption || null,
        selectedOption: vm.invenioSearchArgs.params[attrs.sortKey] || attrs.defaultOption ||  null,
        sortKey:  attrs.sortKey || 'sort',
      };
      // Attach the function to check if is selected or not
      scope.isSelected = isSelected;

      // When scope.data has changed
      scope.$watchCollection(
        'data.selectedOption', onChange
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

  /**
   * @ngdoc directive
   * @name invenioSearchSortOrder
   * @description
   *    The invenioSearchSortOrder directive
   * @namespace invenioSearchSortOrder
   * @example
   *    Usage:
   *    <invenio-search-sort-order
   *     label="Z->A"
   *     sort-key="sort"
   *     template='TEMPLATE_PATH'>
   *        ... Any children directives
   *    </invenio-search-sort-order>
   */
  function invenioSearchSortOrder($timeout) {

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
        $timeout(function() {
          vm.invenioSearchArgs.params = angular.merge(
            vm.invenioSearchArgs.params, params
          );
        }, 0);
      }

      /**
       * Check if url has sorting order
       * @memberof link
       */
      function hasSortingOrder() {
        return (
            vm.invenioSearchArgs.params[attrs.sortKey] || ''
          ).indexOf('-') === -1 ? false : true;
      }

      /**
       * Handle click
       * @memberof link
       */
      function handleClick() {
        var sortValue = [];
        var value = vm.invenioSearchArgs.params[scope.sortKey] || '';
        if (value) {
          if (!hasSortingOrder()) {
            sortValue.push('-');
          } else {
            value = value.slice(1, value.length);
          }
          // Change the button state
          scope.isPressed = !scope.isPressed;
          sortValue.push(value);
          setSortKey(
            scope.sortKey, sortValue.join('')
          );
        }
      }

      // on element click update invenioSearchArgs.params
      scope.sortKey = attrs.sortKey;
      scope.label = attrs.label;

      // Check if the url has sorting option
      if (hasSortingOrder()) {
        scope.isPressed = true;
      }

      function onChange(newValue, oldValue) {
        if (!angular.equals(newValue[scope.sortKey], oldValue[scope.sortKey])){
          if (!hasSortingOrder()) {
            // Change the button state
            scope.isPressed = false;
          }
        }
      }
      // When scope.data has changed
      scope.$watchCollection(
        'vm.invenioSearchArgs.params', onChange
      );
      // When scope.data has changed
      scope.handleClick = handleClick;
    }

    /**
     * Choose template for search loading
     * @memberof invenioSearchSelectBox
     * @param {service} element - Element that this direcive is assigned to.
     * @param {service} attrs - Attribute of this element.
     * @example
     *    Minimal template `template.html` usage
     *      <button
     *       ng-click="handleClick()"
     *       ng-class="{'active': isPressed}">
     *        {{ label }}
     *      </button>
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

  // Inject the necessary angular services
  invenioSearchSortOrder.$inject = ['$timeout'];

  ////////////

  // Services

  /**
   * @ngdoc service
   * @name invenioSearchAPI
   * @namespace invenioSearchAPI
   * @param {service} $http - Angular http requests service.
   * @param {service} $q - Angular promise services.
   * @description
   *     Call the search API
   */
  function invenioSearchAPI($http,  $q) {

    /**
     * Make a search request to the API
     * @memberof invenioSearchAPI
     * @param {Object} args - The search request parameters.
     * @returns {service} promise
     */
    function search(args, hidden) {

      // Initialize the promise
      var deferred = $q.defer();

      /**
       * Search on success
       * @memberof invenioSearchAPI
       * @param {Object} response - The search API response.
       * @returns {Object} response
       */
      function success(response) {
        deferred.resolve(response);
      }

      /**
       * Search on error
       * @memberof invenioSearchAPI
       * @param {Object} response - The search API error response.
       * @returns {Object} error
       */
      function error(response) {
        deferred.reject(response);
      }

      // Place all parameters together
      var params = angular.merge({}, args);
      // extend parameters with the hidden params
      params.params = angular.merge(params.params, hidden || {});

      // Make the request
      $http(params).then(
        success,
        error
      );
      return deferred.promise;
    }
    return {
      search: search
    };
  }

  // Inject the necessary angular services
  invenioSearchAPI.$inject = ['$http', '$q'];

  /**
   * @ngdoc service
   * @name invenioSearchHandler
   * @namespace invenioSearchHandler
   * @param {service} $location - Angular window.location service.
   * @description
   *    window.location API
   */
  function invenioSearchHandler($location) {

    /**
     * Get $location.search() parameters
     * @memberof invenioSearchHandler
     * @returns {Object}
     */
    function get() {
      return $location.search();
    }

    /**
     * Set $location.search() parameters
     * @memberof invenioSearchHandler
     * @param {Object} args - The search request parameters.
     * @returns {Object}
     */
    function set(args) {
      $location.search(args);
    }

    ////////////

    return {
      get: get,
      set: set,
    };
  }

  // Inject the necessary angular services
  invenioSearchHandler.$inject = ['$location'];

  ////////////

  // Configuration

  /**
   * @ngdoc interface
   * @name invenioSearchConfiguration
   * @namespace invenioSearchConfiguration
   * @param {service} $locationProvider - Angular window.location provider.
   * @description
   *     Enable HTML5 mode in urls
   */
  function invenioSearchConfiguration($locationProvider) {
      $locationProvider.html5Mode({
        enabled: true,
        requireBase: false,
        rewriteLinks: false,
      });
  }

  // Inject the necessary angular services
  invenioSearchConfiguration.$inject = ['$locationProvider'];

  ////////////

  // Put everything together

  // Setup configuration
  angular.module('invenioSearch.configuration', [])
    .config(invenioSearchConfiguration);

  // Setup services
  angular.module('invenioSearch.services', [])
    .service('invenioSearchHandler', invenioSearchHandler)
    .service('invenioSearchAPI', invenioSearchAPI);

  // Setup controllers
  angular.module('invenioSearch.controllers', [])
    .controller('invenioSearchController', invenioSearchController);

  // Sutup directives
  angular.module('invenioSearch.directives', [])
    .directive('invenioSearch', invenioSearch)
    .directive('invenioSearchBar', invenioSearchBar)
    .directive('invenioSearchError', invenioSearchError)
    .directive('invenioSearchCount', invenioSearchCount)
    .directive('invenioSearchFacets', invenioSearchFacets)
    .directive('invenioSearchResults', invenioSearchResults)
    .directive('invenioSearchLoading', invenioSearchLoading)
    .directive('invenioSearchSortOrder', invenioSearchSortOrder)
    .directive('invenioSearchSelectBox', invenioSearchSelectBox)
    .directive('invenioSearchPagination', invenioSearchPagination);


  // Setup everyhting
  angular.module('invenioSearch', [
    'invenioSearch.configuration',
    'invenioSearch.services',
    'invenioSearch.controllers',
    'invenioSearch.directives'
  ]);

  //////////// HAPPY SEARCHING :)

})(angular);
