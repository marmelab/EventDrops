(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var configurable = require('./util/configurable');

var defaultConfig = {
  xScale: null,
  dateFormat: null
};

module.exports = function (config) {

  config = config || {};
  for (var key in defaultConfig) {
    config[key] = config[key] || defaultConfig[key];
  };

  function delimiter(selection) {
    selection.each(function (data) {
      d3.select(this).selectAll('text').remove();

      var limits = config.xScale.domain();

      d3.select(this).append('text')
        .text(function () {

          return config.dateFormat(limits[0]);
        })
        .classed('start', true)
      ;

      d3.select(this).append('text')
        .text(function () {

          return config.dateFormat(limits[1]);
        })
        .attr('text-anchor', 'end')
        .attr('transform', 'translate(' + config.xScale.range()[1] + ')')
        .classed('end', true)
      ;
    });
  }

  configurable(delimiter, config);

  return delimiter;
};

},{"./util/configurable":6}],2:[function(require,module,exports){
/*global d3 */
"use strict";

var configurable = require('./util/configurable');
var eventLine = require('./eventLine');

var defaultConfig = {
  start: new Date(0),
  end: new Date(),
  width : 1400,
  margin: {
    top: 60,
    left: 280,
    bottom: 40,
    right: 50,
  },
  locale: d3.locale({
    "decimal": ",",
    "thousands": " ",
    "grouping": [3],
    "dateTime": "%A %e %B %Y, %X",
    "date": "%d/%m/%Y",
    "time": "%H:%M:%S",
    "periods": ["AM", "PM"],
    "days": ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"],
    "shortDays": ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."],
    "months": ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"],
    "shortMonths": ["janv.", "févr.", "mars", "avril", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."]
  }),
  tickFormat: [
    [".%L", function(d) { return d.getMilliseconds(); }],
    [":%S", function(d) { return d.getSeconds(); }],
    ["%I:%M", function(d) { return d.getMinutes(); }],
    ["%I %p", function(d) { return d.getHours(); }],
    ["%a %d", function(d) { return d.getDay() && d.getDate() != 1; }],
    ["%b %d", function(d) { return d.getDate() != 1; }],
    ["%B", function(d) { return d.getMonth(); }],
    ["%Y", function() { return true; }]
  ],
  delimiter: require('./delimiter')
};

module.exports = function eventDrops(config) {
  var xScale = d3.time.scale();
  var yScale = d3.scale.ordinal();
  config = config || {};
  for (var key in defaultConfig) {
    config[key] = config[key] || defaultConfig[key];
  };

  function eventDropGraph(selection) {
    selection.each(function (data) {
      var zoom = d3.behavior.zoom().center(null).on("zoom", updateZoom);

      if (config.delimiter) {
        zoom.on("zoomend", redrawDelimiter);
      }
      var graphWidth = config.width - config.margin.right - config.margin.left;
      var graphHeight = data.length * 40;
      var height = graphHeight + config.margin.top + config.margin.bottom;

      d3.select(this).select('svg').remove();

      var svg = d3.select(this)
        .append('svg')
        .attr('width', config.width)
        .attr('height', height)
      ;

      var graph = svg.append('g')
        .attr('transform', 'translate(0, 25)');

      var yDomain = [];
      var yRange = [];

      data.forEach(function (event, index) {
        yDomain.push(event.name);
        yRange.push(index * 40);
      });

      yScale.domain(yDomain).range(yRange);

      var yAxisEl = graph.append('g')
        .classed('y-axis', true)
        .attr('transform', 'translate(0, 60)');

      var yTick = yAxisEl.append('g').selectAll('g').data(yDomain);

      yTick.enter()
        .append('g')
        .attr('transform', function(d) {
          return 'translate(0, ' + yScale(d) + ')';
        })
        .append('line')
        .attr('x1', config.margin.left)
        .attr('x2', config.margin.left + graphWidth);

      yTick.exit().remove();

      svg
        .append('rect')
        .call(zoom)
        .classed('zoom', true)
        .attr('width', graphWidth)
        .attr('height', height )
        .attr('transform', 'translate(' + config.margin.left + ', 35)')
      ;

      xScale.range([0, graphWidth]).domain([config.start, config.end]);
      var tickFormat = config.locale.timeFormat.multi(config.tickFormat);
      xScale.tickFormat(tickFormat);
      zoom.x(xScale);

      var xAxisTop = d3.svg.axis()
        .orient('top')
      ;

      var xAxisBottom = d3.svg.axis()
        .orient('bottom')
      ;

      function updateZoom() {
        if (d3.event.sourceEvent.toString() === '[object MouseEvent]') {
          zoom.translate([d3.event.translate[0], 0]);
        }

        if (d3.event.sourceEvent.toString() === '[object WheelEvent]') {
          zoom.scale(d3.event.scale);
        }

        redraw();
      }

      function redrawDelimiter() {
        svg.select('.delimiter').remove();
        var delimiterEl = svg
          .append('g')
          .classed('delimiter', true)
          .attr('width', graphWidth)
          .attr('height', 10)
          .attr('transform', 'translate(' + config.margin.left + ', 15)')
          .call(config.delimiter({xScale: xScale, dateFormat: config.locale.timeFormat("%d %B %Y")}))
        ;
      }

      function redraw() {

        xAxisBottom.scale(xScale);
        xAxisTop.scale(xScale);

        graph.select('.x-axis-top').remove();
        var xAxisEl = graph
          .append('g')
          .classed('x-axis-top', true)
          .attr('transform', 'translate(' + config.margin.left + ', 20)')
          .call(xAxisTop);

        zoom.size([config.width, height]);

        graph.select('.graph-body').remove();
        var graphBody = graph
          .append('g')
          .classed('graph-body', true)
          .attr('transform', 'translate(' + config.margin.left + ', ' + (config.margin.top - 15) + ')');

        var lines = graphBody.selectAll('g').data(data);

        lines.enter()
          .append('g')
          .classed('line', true)
          .attr('transform', function(d) {
            return 'translate(0,' + yScale(d.name) + ')';
          })
          .call(eventLine({xScale: xScale}))
        ;

        lines.exit().remove();

        graph.select('.x-axis-bottom').remove();
        var xAxisElBottom = graph
          .append('g')
          .classed('x-axis-bottom', true)
          .attr('transform', 'translate(' + config.margin.left + ', ' + (graphHeight + 20) + ')')
          .call(xAxisBottom)
        ;
      }

      redraw();
      if (config.delimiter) {
        redrawDelimiter();
      }
    });
  }

  configurable(eventDropGraph, config);

  return eventDropGraph;
};

},{"./delimiter":1,"./eventLine":3,"./util/configurable":6}],3:[function(require,module,exports){
"use strict";

var configurable = require('./util/configurable');
var filterData = require('./filterData');

var defaultConfig = {
  xScale: null
};

module.exports = function (config) {

  config = config || {};
  for (var key in defaultConfig) {
    config[key] = config[key] || defaultConfig[key];
  };

  var eventLine = function eventLine(selection) {
    selection.each(function (data) {
      d3.select(this).selectAll('text').remove();

      d3.select(this).append('text')
        .text(function(d) {
          var count = filterData(d.dates, config.xScale).length;
          return d.name + (count > 0 ? ' (' + count + ')' : '');
        })
        .attr('text-anchor', 'end')
        .attr('transform', 'translate(-20)')
      ;

      d3.select(this).selectAll('circle').remove();

      var circle = d3.select(this).selectAll('circle')
        .data(function(d) {
          // filter value outside of range
          return filterData(d.dates, config.xScale);
        });

      circle.enter()
        .append('circle')
        .attr('cx', function(d) {
          return config.xScale(d);
        })
        .attr('cy', -5)
        .attr('r', 10)
      ;

      circle.exit().remove();

    });
  };

  configurable(eventLine, config);

  return eventLine;
};

},{"./filterData":4,"./util/configurable":6}],4:[function(require,module,exports){
"use strict";

module.exports = function filterDate(data, scale) {
  data = data || [];
  var filteredData = [];
  var boundary = scale.range();
  var min = boundary[0];
  var max = boundary[1];
  data.forEach(function (datum) {
    var value = scale(datum);
    if (value < min || value > max) {
      return;
    }
    filteredData.push(datum);
  });

  return filteredData;
};

},{}],5:[function(require,module,exports){
/*global d3 */
"use strict";

var eventDrop = require('./eventDrop');

d3.chart = d3.chart || {};

d3.chart.eventDrops = eventDrop;

},{"./eventDrop":2}],6:[function(require,module,exports){
module.exports = function configurable(targetFunction, config, listeners) {
  listeners = listeners || {};
  for (var item in config) {
    (function(item) {
      targetFunction[item] = function(value) {
        if (!arguments.length) return config[item];
        config[item] = value;
        if (listeners.hasOwnProperty(item)) {
          listeners[item](value);
        }

        return targetFunction;
      };
    })(item); // for doesn't create a closure, forcing it
  }
};

},{}]},{},[5]);
