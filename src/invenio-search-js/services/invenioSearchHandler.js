/*
 * This file is part of Invenio.
 * Copyright (C) 2017-2018 CERN.
 *
 * Invenio is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

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

angular.module('invenioSearch.services')
  .service('invenioSearchHandler', invenioSearchHandler);
