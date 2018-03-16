/*
 * This file is part of Invenio.
 * Copyright (C) 2015-2018 CERN.
 *
 * Invenio is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
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
