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
