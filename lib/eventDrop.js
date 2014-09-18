/*global d3 */
"use strict";

var configurable = require('./util/configurable');
var eventLine = require('./eventLine');

var defaultLocale = d3.locale({
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
});

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
  locale: defaultLocale,
  tickFormat: defaultLocale.timeFormat.multi([
    [".%L", function(d) { return d.getMilliseconds(); }],
    [":%S", function(d) { return d.getSeconds(); }],
    ["%I:%M", function(d) { return d.getMinutes(); }],
    ["%I %p", function(d) { return d.getHours(); }],
    ["%a %d", function(d) { return d.getDay() && d.getDate() != 1; }],
    ["%b %d", function(d) { return d.getDate() != 1; }],
    ["%B", function(d) { return d.getMonth(); }],
    ["%Y", function() { return true; }]
  ]),
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

      zoom.x(xScale);

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

        var xAxisTop = d3.svg.axis()
          .tickFormat(config.tickFormat)
          .scale(xScale)
          .orient('top')
        ;

        var xAxisBottom = d3.svg.axis()
          .tickFormat(config.tickFormat)
          .scale(xScale)
          .orient('bottom')
        ;

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
