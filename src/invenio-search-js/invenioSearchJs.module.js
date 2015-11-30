/*
 * This file is part of Invenio.
 * Copyright (C) 2015 CERN.
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

  /**
   * @namespace InvenioSearch
   * @desc Create and make the request
   * @memberOf Controllers
   */
  function invenioSearchController(invenioSearchAPI) {

    /**
     * @name invenioDoSearch
     * @desc Does the search query and handles the response
     * @param {String} query The search query
     * @memberOf Controllers.invenioSearchController
     */
    function invenioDoSearch(query) {
      var that = this;
      // enchance the query
      var q = {
        params: {
          q: query
        }
      };

      // Add the query to the request
      that.invenioSearchArgs = angular.merge(that.invenioSearchArgs, q);

      // Reset results
      that.invenioResults = [];
      that.invenioSearchError = false;
      that.invenioSearchLoading = true;
      invenioSearchAPI.search(this.invenioSearchArgs)
        .then(function(response) {
          that.invenioResults = response.data;
        }, function(error) {
          that.invenioSearchError = true;
          console.log(error);
        }).finally(function() {
          that.invenioSearchLoading = false;
        });
    }

    ////////////

    this.invenioDoSearch = invenioDoSearch;
    this.invenioResults = [];
    this.invenioSearchError = false;
    this.invenioSearchLoading = false;
    this.invenioSearchQuery = '';

    // We don't have any logic on the controller until search initialized
    this.invenioSearchArgs = {
      url: '',
      method: 'GET',
      params: {
        page: 1,
        size: 10,
        q: '',
      }
    };
  }

  // Inject the service
  invenioSearchController.$inject = ['invenioSearchAPI'];

  /**
   * @namespace InvenioSearchBar
   * @desc Create searchbox
   * @memberOf Directives
   */

  function invenioSearchBar() {

    /**
     * @name templateUrl
     * @desc Returns the template for the searchbar
     * @memberOf Directives.invenioSearchBar
     */
    function templateUrl(element, attrs) {
      return attrs.searchBarTemplate;
    }

    /**
     * @name link
     * @desc Synchronizes the controller with the directive
     * @memberOf Controllers.invenioSearchBar
     */
    function link(scope, element, attrs) {
      var collectedArgs = {
        url: attrs.searchEndpoint,
        method: attrs.searchMethod,
        params: {
          page: parseInt(attrs.searchPage || 1),
          size: parseInt(attrs.searchSize || 20),
          doc_type: attrs.searchDoctype,
        }
      };
      // Merge the controller's args
      scope.invenioSearchArgs =  angular.merge(scope.invenioSearchArgs, collectedArgs);

      var extraParams = {
        params: JSON.parse(attrs.searchExtraParams)
      };

      // Merge the controller's search arguments
      scope.invenioSearchArgs = angular.merge(scope.invenioSearchArgs, extraParams);
    }

    ////////////

    return {
      scope: {
        invenioSearchArgs: '=',
        invenioSearchDo: '&',
        invenioSearchQuery: '=',
        searchBarInputPlaceholder: '@',
        searchDoctype: '@',
        searchEndpoint: '@',
        searchExtraParams: '@',
        searchPage: '@',
        searchSize: '@',
      },
      templateUrl: templateUrl,
      link: link
    };
  }

  /**
   * @namespace InvenioSearchResults
   * @desc Create search results
   * @memberOf Directives
   */
  function invenioSearchResults() {

    /**
     * @name templateUrl
     * @desc Returns the template for the results
     * @memberOf Directives.invenioSearchResults
     */
    function templateUrl(element, attrs) {
      return attrs.searchResultsTemplate;
    }

    ////////////

    return {
      scope: {
        invenioSearchItems: '=',
        searchResultsTemplate: '@',
        searchResultsRecordTemplate: '@'
      },
      templateUrl: templateUrl
    };

  }

  /**
   * @namespace InvenioSearchResultsLoading
   * @desc Create search resulits
   * @memberOf Directives
   */
  function invenioSearchResultsLoading() {

    /**
     * @name templateUrl
     * @desc Returns the template for the results loading
     * @memberOf Directives.invenioSearchResultsLoading
    */
    function templateUrl(element, attrs) {
      return attrs.searchLoadingTemplate;
    }

    ////////////

    return {
      scope: {
        invenioSearchLoading: '=',
        searchLoadingMessage: '@',
        searchLoadingTemplate: '@',
      },
      templateUrl: templateUrl
    };
  }

  /**
   * @namespace InvenioSearchResultsError
   * @desc Dispalys an error alert
   * @memberOf Directives
   */
  function invenioSearchResultsError() {

    /**
     * @name templateUrl
     * @desc Returns the template for the results error
     * @memberOf Directives.invenioSearchResultsError
     */
    function templateUrl(element, attrs) {
      return attrs.searchMessageTemplate;
    }

    ////////////

    return {
      scope: {
        invenioSearchError: '=',
        searchMessageError: '@',
        searchMessageTemplate: '@',
      },
      templateUrl: templateUrl
    };
  }

  /**
   * @namespace InvenioSearchResultsCount
   * @desc Displays how many records have been found
   * @memberOf Directives
   */
  function invenioSearchResultsCount() {

    /**
     * @name templateUrl
     * @desc Returns the template for the results error
     * @memberOf Directives.invenioSearchResultsError
     */
    function templateUrl(element, attrs) {
      return attrs.searchCountTemplate;
    }

    ////////////

    return {
      scope: {
        invenioSearchItems: '=',
        searchCountTemplate: '@',
      },
      templateUrl: templateUrl
    };
  }

  /**
   * @namespace InvenioSearchResultsPagination
   * @desc Displays search results pagination
   * @memberOf Directives
   */
  function invenioSearchResultsPagination() {

    return {
      scope: {
        invenioSearchArgs: '=',
        invenioSearchDo: '&',
        invenioSearchItems: '=',
        invenioSearchQuery: '=',
        searchPaginationTemplate: '@',
      },
      templateUrl: templateUrl,
      link: link,
    };

    ////////////

    /**
     * @name templateUrl
     * @desc Returns the template for the results error
     * @memberOf Directives.invenioSearchResultsError
     */
    function templateUrl(element, attrs) {
      return attrs.searchPaginationTemplate;
    }

    /**
     * @name link
     * @desc Synchronizes the controller with the directive
     * @memberOf Controllers.invenioSearchBar
     */
    function link(scope, element, attrs) {
      // Watch when `invenioSearchArgs` changes and fire a new search
      scope.paginatePages = [];

      scope.$watch('invenioSearchArgs.params.page', function(current, next) {
        if (current !== next) {
          scope.invenioSearchDo({query:scope.invenioSearchQuery});
          buildPages();
        }
      });
      scope.$watch('invenioSearchItems', function(current, next) {
        buildPages();
      });

      /**
       * @name addPages
       * @desc Adds a range of numbers to our list
       *
       * @param {int} start The start of the range to add to the paging list
       * @param {int} finish The end of the range to add to the paging list
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
       * @name addLast
       * @desc Add the last or end items in our paging list
       *
       * @param {int} pageCount The last page number or total page count
       * @param {int} prev The previous page number in the paging sequence
       */
      function addLast(pageCount, prev) {
        if (prev !== pageCount - 2) {
          addDots();
        }
        addRange(pageCount - 1, pageCount);
      }

      /**
       * @name addDots
       * @desc Add Dots ie: 1 2 [..] 10 11 12 [..] 56 57
       */
      function addDots() {
        scope.paginatePages.push({
          value: '..'
        });
      }

      /**
       * @name addFirst
       * @desc Add the first or beginning items in our paging list
       *
       * @param {int} next The next page number in the paging sequence
       */
      function addFirst(next) {
        addRange(1, 2);
        if (next !== 3) {
          addDots();
        }
      }

      /**
       * @name buildPages
       * @desc Caclulate pages
       */
      function buildPages() {
        // Reset pages
        scope.paginatePages = [];
        // How many neighbours to show before and after the current page
        var adjacent = 2;
        // Get total pages based on the results shown by page
        var pageCount = total();
        // Get the current page
        var _current = current();
        // Display the adjacent a1 a2 a3 + current + a5 a6 a7
        var adjacentSize = (2 * adjacent) + 2;

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
            addLast(pageCount, finish);
          } else if (_current < pageCount - (adjacent + 2)) {
            start = _current - adjacent;
            finish = _current + adjacent;
            addFirst(start);
            addRange(start, finish);
            addLast(pageCount, finish);
          } else {
            start = pageCount - adjacentSize;
            finish = pageCount;
            addFirst(start);
            addRange(start, finish);
          }
        }
      }

      /**
       * @name total
       * @desc Caclulate the total number of pages
       */
      function total() {
        var _total;
        try {
          _total = scope.invenioSearchItems.hits.total;
        } catch (error) {
          _total = 0;
        }
        return Math.ceil(_total/scope.invenioSearchArgs.params.size);
      }

      /**
       * @name current
       * @desc Calculate the current page
       */
      function current() {
        return scope.invenioSearchArgs.params.page || 1;
      }

      /**
       * @name next
       * @desc Calculate the next page
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
       * @name previous
       * @desc Calculate the previous page
       */
      function previous() {
        var _previous = current();
        var _total = total();
        if (_previous <= _total) {
          _previous = _previous - 1;
        }
        return _previous;
      }

      /**
       * @name getPageClass
       * @desc Calculate page class if it is active or not
       *
       * @param {int} index A given page of the array
       */
      function getPageClass(index) {
        return index === current() ? 'active' : '';
      }

      /**
       * @name getNextClass
       * @desc Calculate the next arrow if it is active or not
       */
      function getNextClass() {
        return current() < total() ? '' : 'disabled';
      }

      /**
       * @name getPrevClass
       * @desc Calculate the previous arrow if it is active or not
       */
      function getPrevClass() {
        return current() > 1 ? '' : 'disabled';
      }

      /**
       * @name getFirstClass
       * @desc Calculate the go to first if it is active or not
       */
      function getFirstClass() {
        return current() !== 1 ? '' : 'disabled';
      }

      /**
       * @name getLastClass
       * @desc Calculate the go to last if it is active or not
       */
      function getLastClass() {
        return current() !== total() ? '' : 'disabled';
      }

      /**
       * @name changePage
       * @desc Change page to the given index
       *
       * @param {int} index A given page of the array
       */
      function changePage(index) {
        if (index > total()) {
          scope.invenioSearchArgs.params.page = total();
        } else if ( index < 1) {
          scope.invenioSearchArgs.params.page = 1;
        } else {
          scope.invenioSearchArgs.params.page = index;
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
  }

  /**
   * @namespace InvenioSearchResultsFacets
   * @desc Displays search results facets
   * @memberOf Directives
   */
  function invenioSearchResultsFacets() {

    return {
      scope: {
        invenioSearchError: '=',
        searchMessageError: '@',
        searchFacetsTemplate: '@',
      },
      templateUrl: templateUrl
    };

    ////////////

    /**
     * @name templateUrl
     * @desc Returns the template for the results error
     * @memberOf Directives.invenioSearchResultsError
     */
    function templateUrl(element, attrs) {
      return attrs.searchFacetsTemplate;
    }
  }

  /**
   * @namespace InvenioSearchAPI
   * @desc Creates a commputication between backend and the searchbox
   * @memberOf Services
   */
  function invenioSearchAPI($http, $q) {

    return {
      search: search
    };

    ////////////

    /**
     * @name search
     * @desc Makes the search request to the given endpoint
     *
     * @param {Object} args the `$http` args given from Controllers.SearchControllers.invenioSearchArgs
     * @returns {Object} promise
     * @memberOf Services.invenioSearchAPI
     */
    function search(args) {
      var deferred = $q.defer();
      $http(args).then(function(response) {
        deferred.resolve(response);
      }, function(error) {
        deferred.reject(error);
      }, function(update) {
        deferred.notify(update);
      });
      return deferred.promise;
    }
  }

  // Inject the $http and $q
  invenioSearchAPI.$inject = ['$http', '$q'];

  // Setup angular directives
  angular.module('invenioSearchJs.directives', [])
    .directive('invenioSearchBar', invenioSearchBar)
    .directive('invenioSearchResults', invenioSearchResults)
    .directive('invenioSearchResultsCount', invenioSearchResultsCount)
    .directive('invenioSearchResultsError', invenioSearchResultsError)
    .directive('invenioSearchResultsFacets', invenioSearchResultsFacets)
    .directive('invenioSearchResultsLoading', invenioSearchResultsLoading)
    .directive('invenioSearchResultsPagination', invenioSearchResultsPagination);

  // Setup controllers
  angular.module('invenioSearchJs.controllers', [])
    .controller('invenioSearchController', invenioSearchController);

  // Setup services
  angular.module('invenioSearchJs.services', [])
    .service('invenioSearchAPI', invenioSearchAPI);

  // Setup everyhting
  angular.module('invenioSearchJs', [
    'invenioSearchJs.services',
    'invenioSearchJs.controllers',
    'invenioSearchJs.directives'
  ]);

})(angular);
