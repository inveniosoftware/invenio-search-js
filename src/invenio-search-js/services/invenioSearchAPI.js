/*
 * This file is part of Invenio.
 * Copyright (C) 2017-2018 CERN.
 *
 * Invenio is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

/**
  * @ngdoc service
  * @name invenioSearchAPI
  * @namespace invenioSearchAPI
  * @param {service} $http - Angular http requests service.
  * @param {service} $q - Angular promise services.
  * @description
  *     Call the search API
  */
function invenioSearchAPI($http, $q, $window) {

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
    // Extend parameters with the hidden params
    params.params = angular.merge(params.params, hidden || {});
    // Make sure the params are encoded
    // By default Angular is not so strict and we have to override the
    // serializer
    // https://github.com/angular/angular.js/blob/464dde8bd12d9be8503678ac57529
    // 45661e006a5/src/Angular.js#L1464-L1491
    params.paramSerializer = function(data) {
      var output = [];
      angular.forEach(data, function(value, key) {
        if (angular.isArray(value)) {
          var that = this;
          value.filter(function(item) {
            that.push($window.encodeURIComponent(key) + '=' + $window.encodeURIComponent(item));
          });
        } else {
          this.push($window.encodeURIComponent(key) + '=' + $window.encodeURIComponent(value));
        }
      }, output);
      return output.join('&');
    };
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
invenioSearchAPI.$inject = ['$http', '$q', '$window'];

angular.module('invenioSearch.services')
  .service('invenioSearchAPI', invenioSearchAPI);
