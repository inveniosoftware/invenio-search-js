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
  function invenioSearchController($scope, invenioSearchHandler,
    invenioSearchAPI) {

    // Assign controller to `vm`
    var vm = this;

    // Parameters

    // Initialize search results
    vm.invenioSearchResults = {};

    // Initialize error results
    vm.invenioSearchErrorResults = {};

    // Search Loading - if invenioSearch has the state loading
    vm.invenioSearchLoading = true;

    // Search Error - if invenioSearch has the state error
    vm.invenioSearchError = {};

    // Search Initialized - if the invenioSearch is initialized
    vm.invenioSearchInitialized = false;

    // Search Query Args - invenioSearch query arguments
    vm.invenioSearchArgs = {};
    vm.invenioSearchSortArgs = {};

    // Initialize current search args
    vm.invenioSearchCurrentArgs = {
      method: 'GET',
      params: {
        page: 1,
        size: 20,
      }
    };

    ////////////

    // Functions

    /**
     * Get url parameters.
     * @memberof invenioSearchController
     * @function invenioSearchGetUrlArgs
     * @returns {Object} The url parameters.
     */
    function invenioSearchGetUrlArgs() {
      return invenioSearchHandler.get();
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
      vm.invenioSearchErrorsResults = {};

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
        $scope.$broadcast('invenio.search.success', response);
      }

      /**
       * After an errored request
       * @memberof invenioDoSearch
       * @function erroredRequest
       * @param {Object} response - The search request response.
       */
      function erroredRequest(response) {
        // Broadcast the error
        $scope.$broadcast('invenio.search.error', response);
      }

      invenioSearchAPI
        .search(vm.invenioSearchCurrentArgs, vm.invenioSearchHiddenParams)
        .then(successfulRequest, erroredRequest)
        .finally(clearRequest);
    }

    /**
     * Parse query string args from a full URL
     * @memberof invenioSearchController
     * @function parseURLQueryString
     * @param {String} url - The URL to parse.
     */
    function parseURLQueryString(url) {
      var query_string = (url.split('?')[1] || '').split('&');
      var data = {};

      for (var i = 0; i < query_string.length; i += 1) {
        var param = (query_string[i] || '').split('=');
        var key = decodeURIComponent(param[0] || '');
        if (key) {
          data[key] = decodeURIComponent(param[1] || '');
        }
      }

      return data;
    }

    /**
     * Process a search error
     * @memberof invenioSearchController
     * @function invenioSearchErrorHandler
     * @param {Object} evt - The event object.
     * @param {Object} response - The error response.
     */
    function invenioSearchErrorHandler(evt, response) {
      vm.invenioSearchErrorResults = response.data;
      // Set the new error
      vm.invenioSearchError = evt;
    }

    /**
     * Process a search success
     * @memberof invenioSearchController
     * @function invenioSearchSuccessHandler
     * @param {Object} evt - The event object.
     * @param {Object} response - The success response.
     */
    function invenioSearchSuccessHandler(evt, response) {
      // Set results
      vm.invenioSearchResults = response.data;
      // Set error to none
      vm.invenioSearchErrorResults = {};

      // Save parameters from request
      if (response.data.links) {
        var data = parseURLQueryString(response.data.links.self);
        if (data['page']) {
          data['page'] = parseInt(data['page']);
        }
        if (data['size']) {
          data['size'] = parseInt(data['size']);
        }
        delete data['q'];
        if (!angular.equals(vm.invenioSearchCurrentArgs, data)) {
          vm.invenioSearchSortArgs = data;
        }
      }
    }

    /**
     * Process the initialization
     * @memberof invenioSearchController
     * @function invenioSearchInitialization
     * @param {Object} evt - The event object.
     * @param {Object} params - The search parameters.
     */
    function invenioSearchInitialization(evt, params) {
      vm.invenioSearchCurrentArgs = angular.merge(
        {},
        vm.invenioSearchCurrentArgs,
        params
      );
      vm.invenioSearchArgs = angular.merge(
        {},
        vm.invenioSearchCurrentArgs.params
      );
      // Update url
      invenioSearchHandler.set(vm.invenioSearchArgs);
      // Repalce url, resolves browser's back button issues
      invenioSearchHandler.replace();
      // Update searcbox query
      vm.userQuery = vm.invenioSearchArgs.q;
      // Invenio Search is now initialized
      vm.invenioSearchInitialized = true;
      // Do the initial search
      vm.invenioDoSearch();
      // Broadcast initialiazation
      $scope.$broadcast('invenio.search.initialiazed');
    }

    /**
     * Process the search request
     * @memberof invenioSearchController
     * @function invenioSearchRequestSearch
     * @param {Object} evt - The event object.
     * @param {Object} params - The search parameters.
     * @param {Boolean} force - Ommit merge and force search with parameters.
     */
    function invenioSearchRequestSearch(evt, params, force) {
      // If force (mostly comming from the url overwrite everything
      if (force !== undefined && force === true) {
        vm.invenioSearchCurrentArgs.params = angular.copy(params);
      } else {
        // Otherwise just merge

        // If the page is the same and the query different reset it
        if (vm.invenioSearchCurrentArgs.params.page === params.page) {
          params.page = 1;
        }
        // FIXME: Maybe loDash?
        angular.forEach(params, function(value, key) {
          vm.invenioSearchCurrentArgs.params[key] = value;
        });
      }

      // InvenioSearchArgs update
      vm.invenioSearchArgs = angular.copy(
        vm.invenioSearchCurrentArgs.params
      );

      // Update url
      invenioSearchHandler.set(vm.invenioSearchCurrentArgs.params);
      // Update searcbox query
      vm.userQuery = vm.invenioSearchArgs.q;
      // Do the search
      vm.invenioDoSearch();
    }

    /**
     * Process the search URL request
     * @memberof invenioSearchController
     * @function invenioSearchRequestFromLocation
     * @param {Object} evt - The event object.
     * @param {String} before - The current url.
     * @param {String} after - The new url.
     */
    function invenioSearchRequestFromLocation(evt, before, after) {
      // When location changed check if there is any difference
      var urlArgs = invenioSearchHandler.get();
      if (!angular.equals(urlArgs, vm.invenioSearchCurrentArgs.params)) {
        // Request a search
        $scope.$broadcast('invenio.search.request', urlArgs, true);
      }
    }

    /**
     * Process the search URL request
     * @memberof invenioSearchController
     * @function invenioSearchRequestFromChange
     * @param {Object} evt - The event object.
     * @param {Object} params - The requested search parameters.
     */
    function invenioSearchRequestFromChange(evt, params) {
      // Get the current and apply the changes
      var current = angular.copy(vm.invenioSearchCurrentArgs.params);
      angular.forEach(params, function(value, key) {
        current[key] = angular.copy(params[key]);
      });
      if (!angular.equals(vm.invenioSearchCurrentArgs.params, current)) {
        // Request a search
        $scope.$broadcast('invenio.search.request', current);
      }
    }

    /**
     * Process the search URL request
     * @memberof invenioSearchController
     * @function invenioSearchRequestFromInternal
     * @param {Object} before - The current object.
     * @param {Object} after - The new object.
     */
    function invenioSearchRequestFromInternal(after, before) {
      // When the vm invenioSearchArgs changed
      if (!angular.equals(after, vm.invenioSearchCurrentArgs.params)) {
        // Request a search
        $scope.$broadcast('invenio.search.request', after);
      }
    }

    ////////////

    // Assignments

    // Search URL arguments
    vm.invenioSearchGetUrlArgs = invenioSearchGetUrlArgs;
    // Invenio Do Search
    vm.invenioDoSearch = invenioDoSearch;
    // URL Parser
    vm.parseURLQueryString = parseURLQueryString;

    ////////////

    // Listeners

    // When invenio.search initialazation request
    $scope.$on('invenio.search.initialazation', invenioSearchInitialization);
    // When the search was requested
    $scope.$on('invenio.search.request', invenioSearchRequestSearch);
    // When the search was successful
    $scope.$on('invenio.search.success', invenioSearchSuccessHandler);
    // When the search errored
    $scope.$on('invenio.search.error', invenioSearchErrorHandler);
    // When change parameters have been requested
    $scope.$on('invenio.search.params.change', invenioSearchRequestFromChange);
    // When URL parameters changed
    $scope.$on('$locationChangeStart', invenioSearchRequestFromLocation);

    ////////////

    // Watchers

    // When invenioSearchArgs.params has changed
    $scope.$watch(
      'vm.invenioSearchArgs', invenioSearchRequestFromInternal, true
    );
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
   *     search-headers='{"Accept": "application/json"}'
   *     search-hidden-params='{"collection": "Collection"}'
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
        headers: JSON.parse(attrs.searchHeaders || '{}'),
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
      var params = angular.merge(
        {},
        collectedArgs,
        extraParams,
        urlParams
      );

      // Brodcast ready to initialization
      scope.$broadcast('invenio.search.initialazation', params);
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
      // Make a copy of the paremeters
      scope.handler = angular.copy(
        vm.invenioSearchCurrentArgs.params
      );

      /**
       * Handle click on the element
       * @memberof link
       * @function handleClick
       * @param {string} key - The facet key.
       * @param {string} value - The facet value.
       */
      function handleClick(key, value) {
        // Make sure it's an object
        scope.handler[key] = (scope.handler[key] === undefined) ? [] : scope.handler[key];
        // Get the index
        var index = (scope.handler[key]).indexOf(value);
        if (index === -1) {
          // Add the value in the list
          scope.handler[key].push(value);
        } else {
          // When the params are populated from a direct link, 
          // the type is a string, not a list, so splice will fail.
          if (typeof scope.handler[key] === "string") {
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

      // Listeners

      // On search finish update facets
      scope.$on('invenio.search.finished', function(evt) {
        scope.handler = angular.copy(vm.invenioSearchCurrentArgs.params);
      });

      // Assignments

      // Clicking the facets
      scope.handleClick = handleClick;
      // Return the values
      scope.getValues = getValues;
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

      scope.$watch('vm.invenioSearchArgs.page', function(current, next) {
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
        return Math.ceil(_total/vm.invenioSearchArgs.size);
      }

      /**
       * Calculate the current page
       * @memberof link
       */
      function current() {
        return parseInt(vm.invenioSearchArgs.page) || 1;
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
          vm.invenioSearchArgs.page = total();
        } else if ( index < 1) {
          vm.invenioSearchArgs.page = 1;
        } else {
          vm.invenioSearchArgs.page = index;
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
          vm.invenioSearchCurrentArgs[scope.sortKey] || '');
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

  /**
   * @ngdoc directive
   * @name invenioSearchRange
   * @description
   *    The invenioSearchRange directive
   * @namespace invenioSearchRange
   * @example
   *    Usage:
   *    <div style="width: 220px; margin: 0 auto;" id="year_hist"></div>
   *    <div style="width: 220px; margin: 0 auto;" id="year_select"></div>
   */
  function invenioSearchRange(invenioSearchRangeFactory, $window) {

    // Functions

    /**
     * Force apply the attributes to the scope
     * @memberof invenioSearchRange
     * @param {service} scope -  The scope of this element.
     * @param {service} element - Element that this directive is assigned to.
     * @param {service} attrs - Attribute of this element.
     * @param {invenioSearchController} vm - Invenio search controller.
     */
    function link(scope, element, attrs, vm) {

      // Default options for histogram
      var options = {
        height: 70,
        name: 'years',
        histogramId: '#hist',
        selectionId: '#select',
        margins: {
          left: 10,
          right: 10,
          top: 10,
          bottom: 0
        },
        barColor: '#2c3e50',
        selectColor: '#3498db',
        lineColor: '#ccc',
        circleColor: 'white',
        padding: 2
      };

      var getRangeWidth = function() {
        var elem = d3.select(options.histogramId).node();
        return elem.getBoundingClientRect().width;
      };

      angular.merge(options, angular.fromJson(attrs.options));

      var responsive = !options.width;
      if (responsive) {
        var initialWidth = getRangeWidth();
      }

      /**
       * Handle the change of the selected range
       * @memberof link
       * @param {int} from - The first element of the range
       * @param {int} to - The last element of the range
         */
      function changeUserSelection(from, to) {
        if (!isNaN(from) && !isNaN(to)) {
          // Update Args
          var params = {};
          var rangeParams = {
            from: from,
            to: to
          };

          var newRange = rangeParams.from + '--' + rangeParams.to;
          params[options.name] = newRange;
          // Request a new search
          scope.$broadcast('invenio.search.params.change', params);
        }
      }

      /**
       * Render a new histogram
       * @memberof link
       */
      function updateRange() {
        // Don't refresh the histogram if the update is a result of
        // moving the histogram bar
        if (responsive) {
          options.width = getRangeWidth() || initialWidth;
        }

        if (vm.invenioSearchResults.aggregations) {
          var buckets = vm.invenioSearchResults.aggregations[options.name].buckets;
          if (buckets.length > 0) {
            if (vm.invenioSearchArgs[options.name]) {
              // Parse URL parameters
              var args = vm.invenioSearchArgs[options.name].split('--');
              var rMin = +args[0];
              var rMax = (args.length === 2) ? +args[1] : rMin;
              if (!isNaN(rMin) && !isNaN(rMax)) {
                options.selectionRange = {
                  min: rMin,
                  max: rMax
                };
              }
            }
            invenioSearchRangeFactory(
              options.histogramId,
              options.selectionId,
              buckets,
              options,
              changeUserSelection
            );
          }
        }
      }

      scope.$on('invenio.search.finished', updateRange);
      if (responsive) {
        angular.element($window).bind('resize', updateRange);
      }
    }

    /**
     * Choose template for search loading
     * @memberof invenioSearchSelectBox
     * @param {service} element - Element that this direcive is assigned to.
     * @param {service} attrs - Attribute of this element.
     * @example
     *    Minimal template `template.html` usage
     *     <div id="hist"></div>
     *     <div id="select"></div>
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

  invenioSearchRange.$inject = ['invenioSearchRangeFactory', '$window'];

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
      var params = angular.copy(args);
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

    /**
     * Replace the url without changing state
     * @memberof invenioSearchHandler
     */
    function replace() {
      $location.replace();
    }

    ////////////

    return {
      get: get,
      replace: replace,
      set: set,
    };
  }

  // Inject the necessary angular services
  invenioSearchHandler.$inject = ['$location'];

  ////////////

  // Factories

  /**
   * @ngdoc factory
   * @name invenioSearchRangeFactory
   * @namespace invenioSearchRangeFactory
   * @description
   *     Render the range histogram on the provided div elements
   */

  function invenioSearchRangeFactory() {

    var histSvg, selectorSvg, xScale, yScale, brush, selected = [], options,
      rangeStart, rangeEnd;

    var processData = function (data) {

      data.forEach(function (d) {
        d.key = +d.key_as_string;

        if (options.selectionRange) {
          d.selected = d.key >= options.selectionRange.min &&
              d.key <= options.selectionRange.max;
        } else {
          d.selected = true;
        }

      });

      var keys = data.map(function (e) {
        return e.key;
      });

      rangeStart = Math.min.apply(undefined, keys);
      rangeEnd = Math.max.apply(undefined, keys);
    };

    var updateBrushPosition = function (range) {
      range = angular.copy(range);

      if (range[0] === range[1]) {
        range[1] += 0.00001;
      }

      brush.extent(range);
      brush(d3.select('.brush').transition());
      brush.event(d3.select('.brush').transition());
    };

    var createSelector = function (placement, selectPlacement, onSelection) {
      if (selectorSvg) {
        selectorSvg.remove();
      }

      selectorSvg = d3.select(selectPlacement).append('svg')
          .attr({
            'width': options.width,
            'height': 35
          }).style('fill', options.selectColor)
          .style('overflow', 'visible');

      selectorSvg.append('line').attr(
          {'x1': 0, 'x2': options.width, 'y1': 5.5, 'y2': 5.5}).style({
        'stroke': options.lineColor,
        'stroke-width': 3
      });

      var on_brushed = function () {
        var extent = brush.extent().map(Math.round);

        if (extent.some(isNaN)) {
          extent = [rangeStart, rangeEnd];
        }

        d3.select('.brush-range.min').text(extent[0]);
        d3.select('.brush-range.max').text(extent[1]);

        selected = [];
        d3.selectAll('g.bar').select('rect').style('fill', function (d) {
          d.selected = (d.key >= extent[0] &&
          d.key <= extent[1]);
          if (d.selected) {
            selected.push(d.key);
          }
          return d.selected ? options.selectColor : options.barColor;
        });

      };


      var initialExtent = [rangeStart, rangeEnd];
      if (options.selectionRange) {
        var min_x = parseInt(xScale.domain()[0]);
        var max_x = parseInt(xScale.domain()[1]);

        var rangeMin = (options.selectionRange.min < min_x ||
          options.selectionRange.min > max_x) ?
          min_x : options.selectionRange.min;
        var rangeMax = (options.selectionRange.max > max_x ||
          options.selectionRange.max < min_x) ?
          max_x : options.selectionRange.max;

        initialExtent = [rangeMin, rangeMax];
      }

      brush = d3.svg.brush()
        .x(xScale)
        .extent(initialExtent)
        // When the brushing event is started, this function is called
        // whilst brushing is happening, this function is called
        .on('brush', on_brushed)
        // when finished, brushend is called
        .on('brushend', function () {
          var extent;

          if (selected.length === 0) {
            extent = [rangeStart, rangeEnd];
          } else {
            extent = brush.extent().map(Math.round);
            extent[0] = Math.max(extent[0], rangeStart);
            extent[1] = Math.min(extent[1], rangeEnd);
          }

          updateBrushPosition(extent);

          onSelection.apply(undefined, extent);
        });


      selectorSvg.append('g')
          .attr('class', 'brush')
          .call(brush).selectAll('rect')
          .attr('y', 4)
          .attr('height', 3);

      var brushHandleGroup = selectorSvg.selectAll('.resize').append('g');
      brushHandleGroup.append('circle')
          .attr('r', 5)
          .attr('cx', 0)
          .attr('cy', 6)
          .style({
            'stroke-width': 2,
            'stroke': options.selectColor,
            'fill': options.circleColor
          });

      brushHandleGroup.append('text')
          .attr('text-anchor', 'middle')
          .style('transform', 'rotate(-45deg) translateX(-15px)')
          .text(function (d, i) {
            return parseInt((brush.extent()[i === 0 ? 1 : 0]));
          }).attr('class', function (d, i) {
        return 'brush-range ' + (i === 0 ? 'max' : 'min');
      })
          .attr('y', 31);

      if (parseInt(initialExtent[0]) === parseInt(initialExtent[1])) {
        d3.select('.resize.e').style('display', 'inline');
      }
    };

    /**
     * Renders a histogram and selection bar on the selected elements
     *
     * @param placement {string} - The element to contain the histogram.
     * @param selectPlacement {string} - The element to contain the bar.
     * @param data {Object} - The data to be displayed.
     * @param userOptions {Object} - Options for rendering.
     * @param userOptions.barColor {string} - Color of the unselected bars.
     * @param userOptions.selectColor {string} - Color of the selected bars.
     * @param userOptions.lineColor {string} - Color of the line.
     * @param userOptions.circleColor {string} - Color of the circles on the
     * ends of the selection.
     * @param userOptions.padding {number} - Padding around the histogram.
     * @param {onSelection} onSelection - To be called on selection change.
     */
    function renderHistogram(placement, selectPlacement, data,
                              userOptions, onSelection) {

      options = angular.merge(userOptions, options);

      if (histSvg) {
        histSvg.remove();
      }

      histSvg = d3.select(placement).append('svg')
          .attr({
            'width': options.width,
            'height': options.height
          });

      var group = histSvg.append('g').style('pointer-events', 'all');
      var div = d3.select('body').append('div')
        .attr('class', 'range_tooltip')
        .style({
          'position': 'absolute',
          'text-align': 'center',
          'width': '40px',
          'height': '18px',
          'padding': '2px',
          'font': '12px sans-serif',
          'background': 'lightblue',
          'border': '0px',
          'border-radius': '8px',
          'pointer-events': 'none',
          'opacity': 0
        });

      processData(data);
      var rangeDomain = d3.extent(data, function (d) {
        return d.key;
      });

      rangeDomain[0] = rangeDomain[0] - (0.1 * data.length);
      rangeDomain[1] = rangeDomain[1] + (0.1 * data.length);

      xScale = d3.scale.linear().domain(rangeDomain).range([options.margins.left,
        options.width - options.margins.left - options.margins.right
      ]);

      var barWidth = Math.min(10, ((options.width - options.margins.left -
          options.margins.right) -
          (data.length * options.padding)) / (rangeEnd - rangeStart));

      barWidth = Math.max(1, barWidth);

      var maxValue = d3.max(data, function (d) {
        return d.doc_count;
      });

      yScale = d3.scale.linear().domain([0, maxValue]).range(
          [0, options.height - options.margins.bottom]);

      var rectEnter = group.selectAll('.bar')
          .data(data).enter().append('g').attr('class', 'bar');

      console.log(barWidth);
      rectEnter.append('rect').attr('height', function (d) {
        return yScale(d.doc_count);
      }).attr('width', barWidth)
          .attr('x', function (d) {
            return xScale(d.key) - (barWidth / 2);
          })
          .attr('y', function (d) {
            return yScale.range()[1] - yScale(d.doc_count);
          })
          .style('fill', function (d) {
            return d.selected ? options.selectColor : options.barColor;
          });

      rectEnter.on('mouseenter', function (d) {
        d3.select(this).select('rect').style('fill', d3.rgb(d.selected ?
          options.selectColor : options.barColor).brighter());
          div.transition()
            .duration(200)
            .style('opacity', 0.9);
          div.html(d.doc_count)
            .style('left', (d3.event.pageX) + 'px')
            .style('top', (d3.event.pageY - 28) + 'px');
      })
          .on('mouseout', function (d) {
            d3.select(this).select('rect').style('fill', d.selected ?
              options.selectColor : options.barColor);
            div.transition()
              .duration(500)
              .style('opacity', 0);
          })
          .on('click', function (d) {
            updateBrushPosition([d.key, d.key]);
            d3.select('.resize.e').style('display', 'inline');

          });

      createSelector(placement, selectPlacement, onSelection);
    }

    return renderHistogram;

  }

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

  // Setup factories
  angular.module('invenioSearch.factories', [])
    .factory('invenioSearchRangeFactory', invenioSearchRangeFactory);

  // Setup controllers
  angular.module('invenioSearch.controllers', [])
    .controller('invenioSearchController', invenioSearchController);

  // Setup directives
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
    .directive('invenioSearchPagination', invenioSearchPagination)
    .directive('invenioSearchRange', invenioSearchRange);


  // Setup everyhting
  angular.module('invenioSearch', [
    'invenioSearch.configuration',
    'invenioSearch.services',
    'invenioSearch.factories',
    'invenioSearch.controllers',
    'invenioSearch.directives'
  ]);

  //////////// HAPPY SEARCHING :)

})(angular);
