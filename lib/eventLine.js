"use strict";
/* global require, module, d3 */

var configurable = require('./util/configurable');
var filterData = require('./filterData');

var defaultConfig = {
  xScale: null,
  yScale: null
};

module.exports = function (d3, context) {
  return function (config) {

    config = config || {
      xScale: null,
      yScale: null,
      eventLineColor: 'black',
      width: 0,
      height: 0
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

        var dataContainer = d3.select("body").append('custom');

        function hexToRgb(hex, alpha) {
          var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
          var toString = function () {
              if (!this.alpha) {
                  return "rgb(" + this.r + ", " + this.g + ", " + this.b + ")";
              }
              if (this.alpha > 1) {
                  this.alpha = 1;
              } else if (this.alpha < 0) {
                  this.alpha = 0;
              }
              return "rgba(" + this.r + ", " + this.g + ", " + this.b + ", " + this.alpha + ")";
          };
          if (!alpha) {
              return result ? {
                  r: parseInt(result[1], 16),
                  g: parseInt(result[2], 16),
                  b: parseInt(result[3], 16),
                  toString: toString
              } : null;
          }
          if (alpha > 1) {
              alpha = 1;
          } else if (alpha < 0) {
              alpha = 0;
          }
          return result ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16),
              alpha: alpha,
              toString: toString
          } : null;
        }

        function drawCustom (data) {
          var dates = filterData(data.dates, config.xScale);
          var y = 0;
          if (typeof config.yScale === 'function') {
            y = config.yScale(data.name) + 25;
          }else{
            y = config.yScale + 25;
          }
          var color = 'black';
          if (config.eventLineColor) {
            if (typeof config.eventLineColor === 'function') {
              color = config.eventLineColor(data, data.name);
            }else{
              color = config.eventLineColor;
            }
          }

          var dateTab = dates.sort(function(a, b) {
            return a - b;
          });

          var points = [];
          var index = 0;

          var colors = hexToRgb(color, 1);

          if (context) {
            drawLine(dateTab, y, colors, context, points);
          }
        }

        function drawLine(dates, coorY, colors, context, points) {
          dates.forEach(function(date) {
            var x = config.xScale(date),
                y = coorY,
                size = 15;

                points.push({x:x,y:y,size:size});
          });

          function update() {
            var len = points.length;
            while (len--) {
              var point = points[len];

              context.beginPath();
              var grad = context.createRadialGradient(point.x, point.y, 1, point.x, point.y, point.size);
              if (colors) {
                grad.addColorStop(0, 'rgba(' + colors.r +',' + colors.g + ',' + colors.b + ',1)');
                grad.addColorStop(1, 'rgba(' + colors.r +',' + colors.g + ',' + colors.b + ',0)');
                context.fillStyle = grad;
              }
              context.arc(point.x, point.y, point.size, 0, Math.PI*2);
              context.fill();
            }
            metabalize();
          }

          function metabalize() {
            var threshold = 180;
            var imageData = context.getImageData(0,0,config.width,config.height),
            pix = imageData.data;

            var alpha;
            for (var i = 0, n = pix.length; i < n; i += 4) {
                alpha = pix[i+3];
                if(alpha < threshold){
                    alpha = 0;
                }
                pix[i + 3] = alpha === 0 ? 0 : 255;
            }

            context.putImageData(imageData, 0, 0);
          }

          update();
        }

        drawCustom(data);
      });
    };

    configurable(eventLine, config);

    return eventLine;
  };
};
