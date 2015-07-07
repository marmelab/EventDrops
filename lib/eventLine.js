"use strict";
/* global require, module, d3 */

var configurable = require('./util/configurable');
var filterData = require('./filterData');

var defaultConfig = {
  xScale: null
};

module.exports = function (d3, context, base) {
  return function (config) {

    config = config || {
      xScale: null,
      eventColor: null
    };
    for (var key in defaultConfig) {
      config[key] = config[key] || defaultConfig[key];
    }

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
          .style('fill', 'black')
        ;

        var dataContainer = base.append('custom');

        function drawCustom (data) {
          var dataBinding = dataContainer.selectAll("custom.arc")
          .data(data, function(d) {
            return (d.dates, config.xScale);
          });

          dataBinding.enter()
            .append("custom")
            .classed("arc", true)
            .attr("x", 100)
            .attr("y", 100)
            .attr("r", 8)
            .attr("sAngle", 0)
            .attr("eAngle", 2*Math.PI)
            .attr("fillStyle", config.eventColor);

          dataBinding.exit().remove();

          drawLine(dataBinding);
        }

        function drawLine(dataBinding) {
          var elements = dataContainer.selectAll("custom.arc");
          elements.each(function(d) {
            console.log("coucou");
            var node = dataBinding.node();

            context.beginPath();
            context.fillStyle = node.attr("fillStyle");
            context.arc(node.attr("x"), node.attr("y"), node.attr("r"), node.attr("sAngle"), node.attr("eAngle"));
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
