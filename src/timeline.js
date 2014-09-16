(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var configurable = require('./util/configurable');

var defaultConfig = {
  start: new Date(0),
  end: new Date(),
  fields: {},
  data: [],
  margin: {
    top: 60,
    left: 280,
    bottom: 0,
    right: 50,
  },
  locale: {
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
  },
  tickFormat: [
    [".%L", function(d) { return d.getMilliseconds(); }],
    [":%S", function(d) { return d.getSeconds(); }],
    ["%H:%M", function(d) { return d.getMinutes(); }],
    ["%Hh", function(d) { return d.getHours(); }],
    ["%a %d", function(d) { return d.getDay() && d.getDate() != 1; }],
    ["%b %d", function(d) { return d.getDate() != 1; }],
    ["%B", function(d) { return d.getMonth(); }],
    ["%Y", function() { return true; }]
  ],
  onZoom: function () {}
};

d3.timeline = function(element, config) {
  config = config || {};
  for(var key in defaultConfig) {
    config[key] = config[key] || defaultConfig[key];
  };

  var totalWidth = element.parentNode.width ? element.parentNode.width() : 1000;
  var height = Object.keys(config.fields).length * 39;

  var totalHeight = height + 20 + config.margin.top + config.margin.bottom;
  var width = totalWidth - config.margin.right - config.margin.left;

  var zoom = d3.behavior.zoom().size([width, height]).center(null).on("zoom", draw).on("zoomend", delimiter);

  var svg = d3.select(element)
    .append('svg')
    .attr('width', totalWidth)
    .attr('height', totalHeight);

  var delimiterEl = svg
    .append('g')
    .classed('delimiter', true)
    .attr('width', width)
    .attr('height', 10)
    .attr('transform', 'translate(' + config.margin.left + ', 15)')
  ;

  var graph = svg.append('g')
    .attr('transform', 'translate(0, 25)');

  svg
    .append('rect')
    .call(zoom)
    .classed('zoom', true)
    .attr('width', width)
    .attr('height', height + 10)
    .attr('transform', 'translate(' + config.margin.left + ', 35)')
  ;

  var xScale;

  var filterArray = function(array, max, min) {
    var filteredArray = [];
    array.forEach(function(item) {
      if (item < min || item > max) {
        return;
      }
      filteredArray.push(item);
    });

    return filteredArray;
  };

  var locale = d3.locale(config.locale);

  var tickFormat = locale.timeFormat.multi(config.tickFormat);

  function draw() {
    if (d3.event.sourceEvent.toString() === '[object MouseEvent]') {
      zoom.translate([d3.event.translate[0], 0]);
    }

    if (d3.event.sourceEvent.toString() === '[object WheelEvent]') {
      zoom.scale(d3.event.scale);
    }

    config.onZoom();

    eventTimelineGraph();
  }

  function eventTimelineGraph() {
    if (!config.data) {
      return;
    }

    graph.selectAll('g').remove();

    var xAxis = d3.svg.axis()
      .orient('top')
      .scale(xScale)
      .tickFormat(tickFormat);

    var xAxisBottom = d3.svg.axis()
      .orient('bottom')
      .scale(xScale)
      .tickFormat(tickFormat);

    var xAxisEl = graph
      .append('g')
      .classed('x-axis', true)
      .attr('transform', 'translate(' + config.margin.left + ', 20)');

    xAxisEl.call(xAxis);

    var yDomain = Object.keys(config.fields);

    var yScale = d3.scale.ordinal().domain(yDomain).range([0, 40, 80, 120, 160, 200, 240, 280, 320, 360]);

    var yAxisEl = graph.append('g')
      .classed('y-axis', true)
      .attr('transform', 'translate(0, 60)');

    yAxisEl
      .append('line')
      .attr('x1', config.margin.left)
      .attr('x2', config.margin.left)
      .attr('y1', -40)
      .attr('y2', height - 30);

    var yTick = yAxisEl.append('g').selectAll('g').data(yDomain).enter()
      .append('g')
      .attr('transform', function(d) {
        return 'translate(0, ' + yScale(d) + ')';
      });

    yTick.append('line')
      .attr('x1', config.margin.left)
      .attr('x2', config.margin.left + width);

    var graphBody = graph
      .append('g')
      .classed('graph-body', true)
      .attr('transform', 'translate(' + config.margin.left + ', ' + (config.margin.top - 15) + ')');

    var eventLine = graphBody.selectAll('g')
      .data(config.data).enter()
      .append('g')
      .classed('line', true)
      .attr('transform', function(d) {
        return 'translate(0,' + yScale(d.eventType) + ')';
      });

    var min = Math.round(xScale.invert(0) / 1000);
    var max = Math.round(xScale.invert(width) / 1000);

    eventLine.append('text')
      .text(function(d) {
        var count = filterArray(d.timestamps, max, min).length;
        return config.fields[d.eventType] + (count > 0 ? ' (' + count + ')' : '');
      })
      .attr('text-anchor', 'end')
      .attr('transform', 'translate(-20)');

    eventLine.selectAll('circle')
      .data(function(d) {

        // filter value outside of range
        return filterArray(d.timestamps, max, min);
      })
      .enter()
      .append('circle')
      .attr('cx', function(d) {
        return isNaN(xScale(new Date(d * 1000))) ? 0 : xScale(new Date(d * 1000));
      })
      .attr('cy', -5)
      .attr('r', 10);

    var xAxisElBottom = graph
      .append('g')
      .classed('x-axis', true)
      .attr('transform', 'translate(' + config.margin.left + ', ' + (height + 20) + ')');

    xAxisElBottom.call(xAxisBottom);
  };

  function delimiter() {
    delimiterEl.selectAll('text').remove();

    var delimiterFormat = locale.timeFormat("%d %B %Y");

    delimiterEl.append('text')
      .text(function () {
        var start = (new Date(xScale.invert(0)));

        return delimiterFormat(start);
      })
      .classed('start', true)
    ;

    delimiterEl.append('text')
      .text(function () {
        var end = (new Date(xScale.invert(0)));

        return delimiterFormat(end);
      })
      .attr('text-anchor', 'end')
      .attr('transform', 'translate(' + width + ')')
      .classed('end', true)
    ;
  }


  var updateXScale = function (start, end) {

    xScale = d3.time.scale()
      .range([0, width])
      .domain([start, end]);

    zoom.x(xScale);
  }

  var listeners = {
    start: updateXScale,
    end: updateXScale
  };

  updateXScale(config.start, config.end);
  delimiter();

  configurable(eventTimelineGraph, config, listeners);

  return eventTimelineGraph;
};

},{"./util/configurable":2}],2:[function(require,module,exports){
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

},{}]},{},[1]);
