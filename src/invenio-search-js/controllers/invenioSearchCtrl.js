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
  * @ngdoc controller
  * @name invenioSearchCtrl
  * @namespace invenioSearchCtrl
  * @description
  *    Invenio search controller.
  */
function invenioSearchCtrl($scope, invenioSearchHandler,
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
    * @memberof invenioSearchCtrl
    * @function invenioSearchGetUrlArgs
    * @returns {Object} The url parameters.
    */
  function invenioSearchGetUrlArgs() {
    return invenioSearchHandler.get();
  }

  /**
    * Do the search
    * @memberof invenioSearchCtrl
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
    * @memberof invenioSearchCtrl
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
    * @memberof invenioSearchCtrl
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
    * @memberof invenioSearchCtrl
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
    * @memberof invenioSearchCtrl
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
    // Update url if is not disabled
    if (!vm.disableUrlHandler) {
      // Update url
      invenioSearchHandler.set(vm.invenioSearchArgs);
      // Repalce url, resolves browser's back button issues
      invenioSearchHandler.replace();
    }
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
    * @memberof invenioSearchCtrl
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

    // Update url if is not disabled
    if (!vm.disableUrlHandler) {
      // Update url
      invenioSearchHandler.set(vm.invenioSearchCurrentArgs.params);
    }
    // Update searcbox query
    vm.userQuery = vm.invenioSearchArgs.q;
    // Do the search
    vm.invenioDoSearch();
  }

  /**
    * Process the search URL request
    * @memberof invenioSearchCtrl
    * @function invenioSearchRequestFromLocation
    * @param {Object} evt - The event object.
    * @param {String} before - The current url.
    * @param {String} after - The new url.
    */
  function invenioSearchRequestFromLocation(evt, before, after) {
    if (!vm.disableUrlHandler) {
      // When location changed check if there is any difference
      var urlArgs = invenioSearchHandler.get();
      if (!angular.equals(urlArgs, vm.invenioSearchCurrentArgs.params)) {
        // Request a search
        $scope.$broadcast('invenio.search.request', urlArgs, true);
      }
    }
  }

  /**
    * Process the search URL request
    * @memberof invenioSearchCtrl
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
    * @memberof invenioSearchCtrl
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

  // When invenio.search initialization request
  $scope.$on('invenio.search.initialization', invenioSearchInitialization);
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

invenioSearchCtrl.$inject = [
  '$scope', 'invenioSearchHandler', 'invenioSearchAPI'
];

angular.module('invenioSearch.controllers')
  .controller('invenioSearchCtrl', invenioSearchCtrl);
