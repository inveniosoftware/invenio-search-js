/*
 * This file is part of Invenio.
 * Copyright (C) 2015, 2016, 2017 CERN.
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
angular.module('invenioSearch.services', []);
// Setup factories
angular.module('invenioSearch.factories', []);
// Setup controllers
angular.module('invenioSearch.controllers', []);
// Setup directives
angular.module('invenioSearch.directives', []);

// Setup everyhting
angular.module('invenioSearch', [
  'invenioSearch.configuration',
  'invenioSearch.services',
  'invenioSearch.factories',
  'invenioSearch.controllers',
  'invenioSearch.directives'
]);
