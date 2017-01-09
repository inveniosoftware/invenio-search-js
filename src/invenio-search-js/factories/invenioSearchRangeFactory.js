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

angular.module('invenioSearch.factories')
  .factory('invenioSearchRangeFactory', invenioSearchRangeFactory);
