/*global d3 */
"use strict";

var configurable = require('./util/configurable');
var filterData = require('./filterData');
var eventLine = require('./eventLine');

var defaultConfig = {
  start: new Date(0),
  end: new Date(),
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
    [".%L", function (d) { return d.getMilliseconds(); }],
    [":%S", function (d) { return d.getSeconds(); }],
    ["%H:%M", function (d) { return d.getMinutes(); }],
    ["%Hh", function (d) { return d.getHours(); }],
    ["%a %d", function (d) { return d.getDay() && d.getDate() !== 1; }],
    ["%b %d", function (d) { return d.getDate() !== 1; }],
    ["%B", function (d) { return d.getMonth(); }],
    ["%Y", function () { return true; }]
  ],
  onZoom: function () {}
};

d3.chart = d3.chart || {};

d3.chart.eventDrops = function (element, config) {
  var key;
  config = config || {};
  for (key in defaultConfig) {
    config[key] = config[key] || defaultConfig[key];
  };

  var totalWidth = element.parentNode.width ? element.parentNode.width() : 1000;
  var height = config.data.length * 39;

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

  var xScale = d3.time.scale();

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

    eventDropGraph();
  }

  function eventDropGraph() {
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

    var yDomain = [];
    var yRange = [];

    config.data.forEach(function (event, index) {
      yDomain.push(event.name);
      yRange.push(index * 40);
    });

    var yScale = d3.scale.ordinal().domain(yDomain).range(yRange);

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

    var lines = graphBody.selectAll('g')
      .data(config.data).enter()
      .append('g')
      .classed('line', true)
      .attr('transform', function(d) {
        return 'translate(0,' + yScale(d.name) + ')';
      })
    ;

    lines.call(eventLine({xScale: xScale}));

    var xAxisElBottom = graph
      .append('g')
      .classed('x-axis', true)
      .attr('transform', 'translate(' + config.margin.left + ', ' + (height + 30) + ')');

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
        var end = (new Date(xScale.invert(width)));

        return delimiterFormat(end);
      })
      .attr('text-anchor', 'end')
      .attr('transform', 'translate(' + width + ')')
      .classed('end', true)
    ;
  }

  var updateXScale = function () {

    xScale
      .range([0, width])
      .domain([config.start, config.end])
    ;

    zoom.x(xScale);
  }

  var listeners = {
    start: updateXScale,
    end: updateXScale
  };

  updateXScale();
  delimiter();

  configurable(eventDropGraph, config, listeners);

  return eventDropGraph;
};
