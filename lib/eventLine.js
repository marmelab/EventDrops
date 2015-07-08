"use strict";
/* global require, module, d3 */

var configurable = require('./util/configurable');
var filterData = require('./filterData');

var defaultConfig = {
  xScale: null,
  yScale: null
};

module.exports = function (d3, context, base) {
  return function (config) {

    config = config || {
      xScale: null,
      yScale: null,
      eventColor: null
    };
    for (var key in defaultConfig) {
      config[key] = config[key] || defaultConfig[key];
    }

    var eventLine = function eventLine(selection) {
      selection.each(function (data) {
        var nameLine = data.name;
        d3.select(this).selectAll('text').remove();

        d3.select(this).append('text')
          .text(function(d) {
            var count = filterData(d.dates, config.xScale).length;
            return d.name + (count > 0 ? ' (' + count + ')' : '');
          })
          .attr('text-anchor', 'end')
          .attr('transform', 'translate(-20)')
          .style('fill', 'black')
        ;

        var dataContainer = d3.select("body").append('custom');

        function drawCustom (data) {
          console.log(config.eventLineColor);
          var dates = filterData(data.dates, config.xScale);
          var y = config.yScale(data.name) + 25;
          var color = 'black';
          if (config.eventLineColor) {
            color = config.eventLineColor(data);
          }


          drawLine(dates, y);
        }

        function drawLine(dates, y, color) {
          dates.forEach(function(date) {

            // var node = d3.select(dataBinding.node());

            context.beginPath();
            context.fillStyle = color;
            context.arc(config.xScale(date), y, 10, 0, 2 * Math.PI);
            context.fill();
            context.closePath();
          });
        }

        drawCustom(data);


        /*d3.select(this).selectAll('circle').remove();

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
          .style('fill', config.eventColor)
          .attr('cy', -5)
          .attr('r', 10)
        ;

        circle.exit().remove();*/

      });
    };

    configurable(eventLine, config);

    return eventLine;
  };
};
