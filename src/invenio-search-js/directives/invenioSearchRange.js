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
     * Remove the user selected range
     */
    function resetUserSelection() {
        var params = {};
        delete options.selectionRange;
        params[options.name] = [];
        // Request a new search
        scope.$broadcast('invenio.search.params.change', params);
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
          if (vm.invenioSearchArgs[options.name] && vm.invenioSearchArgs[options.name].length > 0) {
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
    scope.resetRangeSelection = resetUserSelection;
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

angular.module('invenioSearch.directives')
  .directive('invenioSearchRange', invenioSearchRange);
