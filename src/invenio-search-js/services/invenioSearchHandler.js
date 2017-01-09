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
