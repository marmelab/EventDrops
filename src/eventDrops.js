(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
/* global require, module, d3 */

var configurable = require('./util/configurable');

var defaultConfig = {
  xScale: null,
  dateFormat: null
};

module.exports = function (d3) {

  return function (config) {

    config = config || {};
    for (var key in defaultConfig) {
      config[key] = config[key] || defaultConfig[key];
    }

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
};

},{"./util/configurable":7}],2:[function(require,module,exports){
"use strict";
/* global require, module */

var configurable = require('./util/configurable');
var xAxisFactory = require('./xAxis');

module.exports = function (d3, document) {
  var delimiter = require('./delimiter')(d3);
  var filterData = require('./filterData');

  var defaultConfig = {
		start: new Date(0),
		end: new Date(),
		minScale: 0,
		maxScale: Infinity,
		width: 1000,
		margin: {
		  top: 60,
		  left: 200,
		  bottom: 40,
		  right: 50
		},
		locale: null,
		axisFormat: null,
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
		eventHover: null,
		eventZoom: null,
		eventClick: null,
		hasDelimiter: true,
		hasTopAxis: true,
		hasBottomAxis: function (data) {
		  return data.length >= 10;
		},
		eventLineColor: 'black',
		eventColor: null
  };

  return function eventDrops(config) {
		var xScale = d3.time.scale();
		var yScale = d3.scale.ordinal();
		config = config || {};
		for (var key in defaultConfig) {
		  config[key] = config[key] || defaultConfig[key];
		}

		function eventDropGraph(selection) {
		  selection.each(function (data) {
				var zoom = d3.behavior.zoom().center(null).scaleExtent([config.minScale, config.maxScale]).on("zoom", updateZoom);

				zoom.on("zoomend", zoomEnd);

        var graphWidth = config.width - config.margin.right - config.margin.left;
        var graphHeight = data.length * 40;
        var height = graphHeight + config.margin.top + config.margin.bottom;
        var xAxisTop, xAxisBottom;

        var canvas_width = graphWidth;
        var canvas_height = graphHeight;

        var lastX = graphWidth/2;
        var lastY = graphHeight/2;
        var dragged, dragStart;
        var mouseDown = 0;

        var topX = 0;
        var topY = 0;

        var base = d3.select(this);

        d3.select(this).select('canvas').remove();
    		var canvas = d3.select(this)
    		  .append('canvas')
    		  .attr('id', "mon_canvas")
    		  .attr('width', canvas_width)
    		  .attr('height', canvas_height);

  		  var ctx = (canvas.node()).getContext('2d');

        var eventLine = require('./eventLine')(d3, ctx);
        var FilterFactory = require('./filterLining')(ctx);

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
  			  .classed('y-tick', true)
  			  .attr('x1', config.margin.left)
  			  .attr('x2', config.margin.left + graphWidth);

			  yTick.exit().remove();

  			var curx, cury;
  			var zoomRect = svg
  			  .append('rect')
  			  .call(zoom)
  			  .classed('zoom', true)
  			  .attr('width', graphWidth)
  			  .attr('height', height )
  			  .attr('transform', 'translate(' + config.margin.left + ', 35)')
  			;

  			if (typeof config.eventHover === 'function') {
  			  zoomRect.on('mousemove', function(d, e) {
  				var event = d3.event;
  				if (curx == event.clientX && cury == event.clientY) return;
  				curx = event.clientX;
  				cury = event.clientY;
  				zoomRect.attr('display', 'none');
  				var el = document.elementFromPoint(d3.event.clientX, d3.event.clientY);
  				zoomRect.attr('display', 'block');
  				if (el.tagName !== 'circle') return;
  				config.eventHover(el);
  			  });
  			}

  			if (typeof config.eventClick === 'function') {
  			  zoomRect.on('click', function () {
  				zoomRect.attr('display', 'none');
  				var el = document.elementFromPoint(d3.event.clientX, d3.event.clientY);
  				zoomRect.attr('display', 'block');
  				if (el.tagName !== 'circle') return;
  				config.eventClick(el);
  			  });
  			}

        xScale.range([0, graphWidth]).domain([config.start, config.end]);

        zoom.x(xScale);

        function updateZoom() {
          if (d3.event.sourceEvent && d3.event.sourceEvent.toString() === '[object MouseEvent]') {
            zoom.translate([d3.event.translate[0], 0]);
          }

          if (d3.event.sourceEvent && d3.event.sourceEvent.toString() === '[object WheelEvent]') {
            zoom.scale(d3.event.scale);
          }
          redraw();
        }

        // initialization of the delimiter
        svg.select('.delimiter').remove();
        var delimiterEl = svg
          .append('g')
          .classed('delimiter', true)
          .attr('width', graphWidth)
          .attr('height', 10)
          .attr('transform', 'translate(' + config.margin.left + ', ' + (config.margin.top - 45) + ')')
          .call(delimiter({
            xScale: xScale,
            dateFormat: config.locale ? config.locale.timeFormat("%d %B %Y") : d3.time.format("%d %B %Y")
          }))
        ;

        function redrawDelimiter() {
          delimiterEl.call(delimiter({
            xScale: xScale,
            dateFormat: config.locale ? config.locale.timeFormat("%d %B %Y") : d3.time.format("%d %B %Y")
          }));
        }

  			function zoomEnd() {
  			  if (config.eventZoom) {
  				  config.eventZoom(xScale);
  			  }
  			  if (config.hasDelimiter) {
  				  redrawDelimiter();
  			  }
  			}

        var hasTopAxis = typeof config.hasTopAxis === 'function' ? config.hasTopAxis(data) : config.hasTopAxis;
        if (hasTopAxis) {
          xAxisTop = xAxisFactory(d3, config, xScale, graph, graphHeight, 'top');
        }

        var hasBottomAxis = typeof config.hasBottomAxis === 'function' ? config.hasBottomAxis(data) : config.hasBottomAxis;
        if (hasBottomAxis) {
          xAxisBottom = xAxisFactory(d3, config, xScale, graph, graphHeight, 'bottom');
        }

  			function drawXAxis(where) {
  			  // copy config.tickFormat because d3 format.multi edit its given tickFormat data
  			  var tickFormatData = [];

  			  config.tickFormat.forEach(function (item) {
  				  var tick = item.slice(0);
  				  tickFormatData.push(tick);
  			  });

  			  var tickFormat = config.locale ? config.locale.timeFormat.multi(tickFormatData) : d3.time.format.multi(tickFormatData);
  			  var xAxis = d3.svg.axis()
  				  .scale(xScale)
  				  .orient(where)
  				  .tickFormat(tickFormat)
  			  ;

  			  if (typeof config.axisFormat === 'function') {
  				  config.axisFormat(xAxis);
  			  }

  			  var y = (where == 'bottom' ? parseInt(graphHeight) : 0) + config.margin.top - 40;

  			  graph.select('.x-axis.' + where).remove();
  			  var xAxisEl = graph
    				.append('g')
    				.classed('x-axis', true)
    				.classed(where, true)
    				.attr('transform', 'translate(' + config.margin.left + ', ' + y + ')')
    				.call(xAxis)
  			  ;
  			}

  			// initialization of the graph body
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
          .style('fill', config.eventLineColor)
          .call(eventLine({ xScale: xScale, eventColor: config.eventColor }))
        ;

        lines.exit().remove();

        function redraw() {
          // Store the current transformation matrix
          ctx.save();
          // Set back to the original canvas
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          // Clear the canvas
          ctx.clearRect(0, 0, graphWidth, graphHeight);
          // Restore the former coordinates
          ctx.restore();

          var hasTopAxis = typeof config.hasTopAxis === 'function' ? config.hasTopAxis(data) : config.hasTopAxis;
          if (hasTopAxis) {
            xAxisTop.drawXAxis();
          }

          var hasBottomAxis = typeof config.hasBottomAxis === 'function' ? config.hasBottomAxis(data) : config.hasBottomAxis;
          if (hasBottomAxis) {
            xAxisBottom.drawXAxis();
          }

          lines.call(eventLine({ xScale: xScale, yScale: yScale, eventLineColor: config.eventLineColor, eventColor: config.eventColor }));

          // Applying the lining filter
          FilterFactory.filter();
  			}

  			redraw();
  			if (config.hasDelimiter) {
  			  redrawDelimiter();
  			}
  			if (config.eventZoom) {
  			  config.eventZoom(xScale);
  			}
		  });
		}
		configurable(eventDropGraph, config);

		return eventDropGraph;
  };
};

},{"./delimiter":1,"./eventLine":3,"./filterData":4,"./filterLining":5,"./util/configurable":7,"./xAxis":8}],3:[function(require,module,exports){
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

},{"./filterData":4,"./util/configurable":7}],4:[function(require,module,exports){
"use strict";
/* global module */

module.exports = function filterDate(data, scale) {
  data = data || [];
  var boundary = scale.range();
  var min = boundary[0];
  var max = boundary[1];

  return data.filter(function (datum) {
    var value = scale(datum);
    return !(value < min || value > max);
  });
};

},{}],5:[function(require,module,exports){
"use strict";
/* global require, module */

module.exports = function (ctx) {

  var Filters = {};
  Filters.getPixels = function(ctx) {
    return ctx.getImageData(0,0,800,600);
  };

  Filters.filterImage = function(filter, ctx, var_args) {
    var args = [this.getPixels(ctx)];
    for (var i=2; i<arguments.length; i++) {
      args.push(arguments[i]);
    }
    return filter.apply(null, args);
  };

  Filters.createImageData = function(w,h) {
    return ctx.createImageData(w,h);
  };

  Filters.convolute = function(pixels, weights, opaque) {
    var side = Math.round(Math.sqrt(weights.length));
    var halfSide = Math.floor(side/2);
    var src = pixels.data;
    var sw = pixels.width;
    var sh = pixels.height;
    // pad output by the convolution matrix
    var w = sw;
    var h = sh;
    var output = Filters.createImageData(800, 600);
    var dst = output.data;
    // go through the destination image pixels
    for (var y=0; y<h; y++) {
      for (var x=0; x<w; x++) {
        var sy = y;
        var sx = x;
        var dstOff = (y*w+x)*4;
        // calculate the weighed sum of the source image pixels that
        // fall under the convolution matrix
        var r=0, g=0, b=0, a=0;
        for (var cy=0; cy<side; cy++) {
          for (var cx=0; cx<side; cx++) {
            var scy = sy + cy - halfSide;
            var scx = sx + cx - halfSide;
            if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
              var srcOff = (scy*sw+scx)*4;
              var wt = weights[cy*side+cx];
              r += src[srcOff] * wt;
              g += src[srcOff+1] * wt;
              b += src[srcOff+2] * wt;
              a += src[srcOff+3] * wt;
            }
          }
        }
        dst[dstOff] = r;
        dst[dstOff+1] = g;
        dst[dstOff+2] = b;
        dst[dstOff+3] = a;
      }
    }
    return output;
  };

  var filter = function filter() {
    var result = Filters.filterImage(Filters.convolute, ctx,
    [ 1/9, 1/9, 1/9,
      1/9, 1/9, 1/9,
      1/9, 1/9, 1/9 ]
    );

    ctx.putImageData(result, 0, 0);
  };

  return {
    filter: filter
  };
};

},{}],6:[function(require,module,exports){
"use strict";
/* global require, define, module */

var eventDrops = require('./eventDrops');

if (typeof define === "function" && define.amd) {
  define('d3.chart.eventDrops', ["d3"], function (d3) {
    d3.chart = d3.chart || {};
    d3.chart.eventDrops = eventDrops(d3, document);
  });
} else if (window) {
  window.d3.chart = window.d3.chart || {};
  window.d3.chart.eventDrops = eventDrops(window.d3, document);
} else {
  module.exports = eventDrops;
}

},{"./eventDrops":2}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){


module.exports = function (d3, config, xScale, graph, graphHeight, where) {
  var xAxis = {};
  var xAxisEls = {};

  var tickFormatData = [];

  config.tickFormat.forEach(function (item) {
    var tick = item.slice(0);
    tickFormatData.push(tick);
  });

  var tickFormat = config.locale ? config.locale.timeFormat.multi(tickFormatData) : d3.time.format.multi(tickFormatData);
  xAxis[where] = d3.svg.axis()
    .scale(xScale)
    .orient(where)
    .tickFormat(tickFormat)
  ;

  if (typeof config.axisFormat === 'function') {
    config.axisFormat(xAxis);
  }

  var y = (where == 'bottom' ? parseInt(graphHeight) : 0) + config.margin.top - 40;

  xAxisEls[where] = graph
    .append('g')
    .classed('x-axis', true)
    .classed(where, true)
    .attr('transform', 'translate(' + config.margin.left + ', ' + y + ')')
    .call(xAxis[where])
  ;

  var drawXAxis = function drawXAxis() {
    xAxisEls[where]
      .call(xAxis[where])
    ;
  };

  return {
    drawXAxis: drawXAxis
  };
};

},{}]},{},[6])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwibGliL2RlbGltaXRlci5qcyIsImxpYi9ldmVudERyb3BzLmpzIiwibGliL2V2ZW50TGluZS5qcyIsImxpYi9maWx0ZXJEYXRhLmpzIiwibGliL2ZpbHRlckxpbmluZy5qcyIsImxpYi9tYWluLmpzIiwibGliL3V0aWwvY29uZmlndXJhYmxlLmpzIiwibGliL3hBeGlzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMVRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbktBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9FQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vKiBnbG9iYWwgcmVxdWlyZSwgbW9kdWxlLCBkMyAqL1xuXG52YXIgY29uZmlndXJhYmxlID0gcmVxdWlyZSgnLi91dGlsL2NvbmZpZ3VyYWJsZScpO1xuXG52YXIgZGVmYXVsdENvbmZpZyA9IHtcbiAgeFNjYWxlOiBudWxsLFxuICBkYXRlRm9ybWF0OiBudWxsXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChkMykge1xuXG4gIHJldHVybiBmdW5jdGlvbiAoY29uZmlnKSB7XG5cbiAgICBjb25maWcgPSBjb25maWcgfHwge307XG4gICAgZm9yICh2YXIga2V5IGluIGRlZmF1bHRDb25maWcpIHtcbiAgICAgIGNvbmZpZ1trZXldID0gY29uZmlnW2tleV0gfHwgZGVmYXVsdENvbmZpZ1trZXldO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGRlbGltaXRlcihzZWxlY3Rpb24pIHtcbiAgICAgIHNlbGVjdGlvbi5lYWNoKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgIGQzLnNlbGVjdCh0aGlzKS5zZWxlY3RBbGwoJ3RleHQnKS5yZW1vdmUoKTtcblxuICAgICAgICB2YXIgbGltaXRzID0gY29uZmlnLnhTY2FsZS5kb21haW4oKTtcblxuICAgICAgICBkMy5zZWxlY3QodGhpcykuYXBwZW5kKCd0ZXh0JylcbiAgICAgICAgICAudGV4dChmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgIHJldHVybiBjb25maWcuZGF0ZUZvcm1hdChsaW1pdHNbMF0pO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLmNsYXNzZWQoJ3N0YXJ0JywgdHJ1ZSlcbiAgICAgICAgO1xuXG4gICAgICAgIGQzLnNlbGVjdCh0aGlzKS5hcHBlbmQoJ3RleHQnKVxuICAgICAgICAgIC50ZXh0KGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgcmV0dXJuIGNvbmZpZy5kYXRlRm9ybWF0KGxpbWl0c1sxXSk7XG4gICAgICAgICAgfSlcbiAgICAgICAgICAuYXR0cigndGV4dC1hbmNob3InLCAnZW5kJylcbiAgICAgICAgICAuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgnICsgY29uZmlnLnhTY2FsZS5yYW5nZSgpWzFdICsgJyknKVxuICAgICAgICAgIC5jbGFzc2VkKCdlbmQnLCB0cnVlKVxuICAgICAgICA7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBjb25maWd1cmFibGUoZGVsaW1pdGVyLCBjb25maWcpO1xuXG4gICAgcmV0dXJuIGRlbGltaXRlcjtcbiAgfTtcbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcbi8qIGdsb2JhbCByZXF1aXJlLCBtb2R1bGUgKi9cblxudmFyIGNvbmZpZ3VyYWJsZSA9IHJlcXVpcmUoJy4vdXRpbC9jb25maWd1cmFibGUnKTtcbnZhciB4QXhpc0ZhY3RvcnkgPSByZXF1aXJlKCcuL3hBeGlzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGQzLCBkb2N1bWVudCkge1xuICB2YXIgZGVsaW1pdGVyID0gcmVxdWlyZSgnLi9kZWxpbWl0ZXInKShkMyk7XG4gIHZhciBmaWx0ZXJEYXRhID0gcmVxdWlyZSgnLi9maWx0ZXJEYXRhJyk7XG5cbiAgdmFyIGRlZmF1bHRDb25maWcgPSB7XG5cdFx0c3RhcnQ6IG5ldyBEYXRlKDApLFxuXHRcdGVuZDogbmV3IERhdGUoKSxcblx0XHRtaW5TY2FsZTogMCxcblx0XHRtYXhTY2FsZTogSW5maW5pdHksXG5cdFx0d2lkdGg6IDEwMDAsXG5cdFx0bWFyZ2luOiB7XG5cdFx0ICB0b3A6IDYwLFxuXHRcdCAgbGVmdDogMjAwLFxuXHRcdCAgYm90dG9tOiA0MCxcblx0XHQgIHJpZ2h0OiA1MFxuXHRcdH0sXG5cdFx0bG9jYWxlOiBudWxsLFxuXHRcdGF4aXNGb3JtYXQ6IG51bGwsXG5cdFx0dGlja0Zvcm1hdDogW1xuXHRcdFx0W1wiLiVMXCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQuZ2V0TWlsbGlzZWNvbmRzKCk7IH1dLFxuXHRcdFx0W1wiOiVTXCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQuZ2V0U2Vjb25kcygpOyB9XSxcblx0XHRcdFtcIiVJOiVNXCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQuZ2V0TWludXRlcygpOyB9XSxcblx0XHRcdFtcIiVJICVwXCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQuZ2V0SG91cnMoKTsgfV0sXG5cdFx0XHRbXCIlYSAlZFwiLCBmdW5jdGlvbihkKSB7IHJldHVybiBkLmdldERheSgpICYmIGQuZ2V0RGF0ZSgpICE9IDE7IH1dLFxuXHRcdFx0W1wiJWIgJWRcIiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gZC5nZXREYXRlKCkgIT0gMTsgfV0sXG5cdFx0XHRbXCIlQlwiLCBmdW5jdGlvbihkKSB7IHJldHVybiBkLmdldE1vbnRoKCk7IH1dLFxuXHRcdFx0W1wiJVlcIiwgZnVuY3Rpb24oKSB7IHJldHVybiB0cnVlOyB9XVxuXHRcdF0sXG5cdFx0ZXZlbnRIb3ZlcjogbnVsbCxcblx0XHRldmVudFpvb206IG51bGwsXG5cdFx0ZXZlbnRDbGljazogbnVsbCxcblx0XHRoYXNEZWxpbWl0ZXI6IHRydWUsXG5cdFx0aGFzVG9wQXhpczogdHJ1ZSxcblx0XHRoYXNCb3R0b21BeGlzOiBmdW5jdGlvbiAoZGF0YSkge1xuXHRcdCAgcmV0dXJuIGRhdGEubGVuZ3RoID49IDEwO1xuXHRcdH0sXG5cdFx0ZXZlbnRMaW5lQ29sb3I6ICdibGFjaycsXG5cdFx0ZXZlbnRDb2xvcjogbnVsbFxuICB9O1xuXG4gIHJldHVybiBmdW5jdGlvbiBldmVudERyb3BzKGNvbmZpZykge1xuXHRcdHZhciB4U2NhbGUgPSBkMy50aW1lLnNjYWxlKCk7XG5cdFx0dmFyIHlTY2FsZSA9IGQzLnNjYWxlLm9yZGluYWwoKTtcblx0XHRjb25maWcgPSBjb25maWcgfHwge307XG5cdFx0Zm9yICh2YXIga2V5IGluIGRlZmF1bHRDb25maWcpIHtcblx0XHQgIGNvbmZpZ1trZXldID0gY29uZmlnW2tleV0gfHwgZGVmYXVsdENvbmZpZ1trZXldO1xuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIGV2ZW50RHJvcEdyYXBoKHNlbGVjdGlvbikge1xuXHRcdCAgc2VsZWN0aW9uLmVhY2goZnVuY3Rpb24gKGRhdGEpIHtcblx0XHRcdFx0dmFyIHpvb20gPSBkMy5iZWhhdmlvci56b29tKCkuY2VudGVyKG51bGwpLnNjYWxlRXh0ZW50KFtjb25maWcubWluU2NhbGUsIGNvbmZpZy5tYXhTY2FsZV0pLm9uKFwiem9vbVwiLCB1cGRhdGVab29tKTtcblxuXHRcdFx0XHR6b29tLm9uKFwiem9vbWVuZFwiLCB6b29tRW5kKTtcblxuICAgICAgICB2YXIgZ3JhcGhXaWR0aCA9IGNvbmZpZy53aWR0aCAtIGNvbmZpZy5tYXJnaW4ucmlnaHQgLSBjb25maWcubWFyZ2luLmxlZnQ7XG4gICAgICAgIHZhciBncmFwaEhlaWdodCA9IGRhdGEubGVuZ3RoICogNDA7XG4gICAgICAgIHZhciBoZWlnaHQgPSBncmFwaEhlaWdodCArIGNvbmZpZy5tYXJnaW4udG9wICsgY29uZmlnLm1hcmdpbi5ib3R0b207XG4gICAgICAgIHZhciB4QXhpc1RvcCwgeEF4aXNCb3R0b207XG5cbiAgICAgICAgdmFyIGNhbnZhc193aWR0aCA9IGdyYXBoV2lkdGg7XG4gICAgICAgIHZhciBjYW52YXNfaGVpZ2h0ID0gZ3JhcGhIZWlnaHQ7XG5cbiAgICAgICAgdmFyIGxhc3RYID0gZ3JhcGhXaWR0aC8yO1xuICAgICAgICB2YXIgbGFzdFkgPSBncmFwaEhlaWdodC8yO1xuICAgICAgICB2YXIgZHJhZ2dlZCwgZHJhZ1N0YXJ0O1xuICAgICAgICB2YXIgbW91c2VEb3duID0gMDtcblxuICAgICAgICB2YXIgdG9wWCA9IDA7XG4gICAgICAgIHZhciB0b3BZID0gMDtcblxuICAgICAgICB2YXIgYmFzZSA9IGQzLnNlbGVjdCh0aGlzKTtcblxuICAgICAgICBkMy5zZWxlY3QodGhpcykuc2VsZWN0KCdjYW52YXMnKS5yZW1vdmUoKTtcbiAgICBcdFx0dmFyIGNhbnZhcyA9IGQzLnNlbGVjdCh0aGlzKVxuICAgIFx0XHQgIC5hcHBlbmQoJ2NhbnZhcycpXG4gICAgXHRcdCAgLmF0dHIoJ2lkJywgXCJtb25fY2FudmFzXCIpXG4gICAgXHRcdCAgLmF0dHIoJ3dpZHRoJywgY2FudmFzX3dpZHRoKVxuICAgIFx0XHQgIC5hdHRyKCdoZWlnaHQnLCBjYW52YXNfaGVpZ2h0KTtcblxuICBcdFx0ICB2YXIgY3R4ID0gKGNhbnZhcy5ub2RlKCkpLmdldENvbnRleHQoJzJkJyk7XG5cbiAgICAgICAgdmFyIGV2ZW50TGluZSA9IHJlcXVpcmUoJy4vZXZlbnRMaW5lJykoZDMsIGN0eCk7XG4gICAgICAgIHZhciBGaWx0ZXJGYWN0b3J5ID0gcmVxdWlyZSgnLi9maWx0ZXJMaW5pbmcnKShjdHgpO1xuXG4gIFx0XHRcdGQzLnNlbGVjdCh0aGlzKS5zZWxlY3QoJ3N2ZycpLnJlbW92ZSgpO1xuXG4gIFx0XHRcdHZhciBzdmcgPSBkMy5zZWxlY3QodGhpcylcbiAgXHRcdFx0ICAuYXBwZW5kKCdzdmcnKVxuICBcdFx0XHQgIC5hdHRyKCd3aWR0aCcsIGNvbmZpZy53aWR0aClcbiAgXHRcdFx0ICAuYXR0cignaGVpZ2h0JywgaGVpZ2h0KVxuICBcdFx0XHQ7XG5cbiAgXHRcdFx0dmFyIGdyYXBoID0gc3ZnLmFwcGVuZCgnZycpXG4gIFx0XHRcdCAgLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoMCwgMjUpJyk7XG5cbiAgXHRcdFx0dmFyIHlEb21haW4gPSBbXTtcbiAgXHRcdFx0dmFyIHlSYW5nZSA9IFtdO1xuXG4gIFx0XHRcdGRhdGEuZm9yRWFjaChmdW5jdGlvbiAoZXZlbnQsIGluZGV4KSB7XG4gIFx0XHRcdCAgeURvbWFpbi5wdXNoKGV2ZW50Lm5hbWUpO1xuICBcdFx0XHQgIHlSYW5nZS5wdXNoKGluZGV4ICogNDApO1xuICBcdFx0XHR9KTtcblxuICBcdFx0XHR5U2NhbGUuZG9tYWluKHlEb21haW4pLnJhbmdlKHlSYW5nZSk7XG5cblxuICBcdFx0XHR2YXIgeUF4aXNFbCA9IGdyYXBoLmFwcGVuZCgnZycpXG4gIFx0XHRcdCAgLmNsYXNzZWQoJ3ktYXhpcycsIHRydWUpXG4gIFx0XHRcdCAgLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoMCwgNjApJyk7XG5cbiAgXHRcdFx0dmFyIHlUaWNrID0geUF4aXNFbC5hcHBlbmQoJ2cnKS5zZWxlY3RBbGwoJ2cnKS5kYXRhKHlEb21haW4pO1xuXG4gIFx0XHRcdHlUaWNrLmVudGVyKClcbiAgXHRcdFx0ICAuYXBwZW5kKCdnJylcbiAgXHRcdFx0ICAuYXR0cigndHJhbnNmb3JtJywgZnVuY3Rpb24oZCkge1xuICBcdFx0XHRcdHJldHVybiAndHJhbnNsYXRlKDAsICcgKyB5U2NhbGUoZCkgKyAnKSc7XG4gIFx0XHRcdCAgfSlcbiAgXHRcdFx0ICAuYXBwZW5kKCdsaW5lJylcbiAgXHRcdFx0ICAuY2xhc3NlZCgneS10aWNrJywgdHJ1ZSlcbiAgXHRcdFx0ICAuYXR0cigneDEnLCBjb25maWcubWFyZ2luLmxlZnQpXG4gIFx0XHRcdCAgLmF0dHIoJ3gyJywgY29uZmlnLm1hcmdpbi5sZWZ0ICsgZ3JhcGhXaWR0aCk7XG5cblx0XHRcdCAgeVRpY2suZXhpdCgpLnJlbW92ZSgpO1xuXG4gIFx0XHRcdHZhciBjdXJ4LCBjdXJ5O1xuICBcdFx0XHR2YXIgem9vbVJlY3QgPSBzdmdcbiAgXHRcdFx0ICAuYXBwZW5kKCdyZWN0JylcbiAgXHRcdFx0ICAuY2FsbCh6b29tKVxuICBcdFx0XHQgIC5jbGFzc2VkKCd6b29tJywgdHJ1ZSlcbiAgXHRcdFx0ICAuYXR0cignd2lkdGgnLCBncmFwaFdpZHRoKVxuICBcdFx0XHQgIC5hdHRyKCdoZWlnaHQnLCBoZWlnaHQgKVxuICBcdFx0XHQgIC5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCcgKyBjb25maWcubWFyZ2luLmxlZnQgKyAnLCAzNSknKVxuICBcdFx0XHQ7XG5cbiAgXHRcdFx0aWYgKHR5cGVvZiBjb25maWcuZXZlbnRIb3ZlciA9PT0gJ2Z1bmN0aW9uJykge1xuICBcdFx0XHQgIHpvb21SZWN0Lm9uKCdtb3VzZW1vdmUnLCBmdW5jdGlvbihkLCBlKSB7XG4gIFx0XHRcdFx0dmFyIGV2ZW50ID0gZDMuZXZlbnQ7XG4gIFx0XHRcdFx0aWYgKGN1cnggPT0gZXZlbnQuY2xpZW50WCAmJiBjdXJ5ID09IGV2ZW50LmNsaWVudFkpIHJldHVybjtcbiAgXHRcdFx0XHRjdXJ4ID0gZXZlbnQuY2xpZW50WDtcbiAgXHRcdFx0XHRjdXJ5ID0gZXZlbnQuY2xpZW50WTtcbiAgXHRcdFx0XHR6b29tUmVjdC5hdHRyKCdkaXNwbGF5JywgJ25vbmUnKTtcbiAgXHRcdFx0XHR2YXIgZWwgPSBkb2N1bWVudC5lbGVtZW50RnJvbVBvaW50KGQzLmV2ZW50LmNsaWVudFgsIGQzLmV2ZW50LmNsaWVudFkpO1xuICBcdFx0XHRcdHpvb21SZWN0LmF0dHIoJ2Rpc3BsYXknLCAnYmxvY2snKTtcbiAgXHRcdFx0XHRpZiAoZWwudGFnTmFtZSAhPT0gJ2NpcmNsZScpIHJldHVybjtcbiAgXHRcdFx0XHRjb25maWcuZXZlbnRIb3ZlcihlbCk7XG4gIFx0XHRcdCAgfSk7XG4gIFx0XHRcdH1cblxuICBcdFx0XHRpZiAodHlwZW9mIGNvbmZpZy5ldmVudENsaWNrID09PSAnZnVuY3Rpb24nKSB7XG4gIFx0XHRcdCAgem9vbVJlY3Qub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuICBcdFx0XHRcdHpvb21SZWN0LmF0dHIoJ2Rpc3BsYXknLCAnbm9uZScpO1xuICBcdFx0XHRcdHZhciBlbCA9IGRvY3VtZW50LmVsZW1lbnRGcm9tUG9pbnQoZDMuZXZlbnQuY2xpZW50WCwgZDMuZXZlbnQuY2xpZW50WSk7XG4gIFx0XHRcdFx0em9vbVJlY3QuYXR0cignZGlzcGxheScsICdibG9jaycpO1xuICBcdFx0XHRcdGlmIChlbC50YWdOYW1lICE9PSAnY2lyY2xlJykgcmV0dXJuO1xuICBcdFx0XHRcdGNvbmZpZy5ldmVudENsaWNrKGVsKTtcbiAgXHRcdFx0ICB9KTtcbiAgXHRcdFx0fVxuXG4gICAgICAgIHhTY2FsZS5yYW5nZShbMCwgZ3JhcGhXaWR0aF0pLmRvbWFpbihbY29uZmlnLnN0YXJ0LCBjb25maWcuZW5kXSk7XG5cbiAgICAgICAgem9vbS54KHhTY2FsZSk7XG5cbiAgICAgICAgZnVuY3Rpb24gdXBkYXRlWm9vbSgpIHtcbiAgICAgICAgICBpZiAoZDMuZXZlbnQuc291cmNlRXZlbnQgJiYgZDMuZXZlbnQuc291cmNlRXZlbnQudG9TdHJpbmcoKSA9PT0gJ1tvYmplY3QgTW91c2VFdmVudF0nKSB7XG4gICAgICAgICAgICB6b29tLnRyYW5zbGF0ZShbZDMuZXZlbnQudHJhbnNsYXRlWzBdLCAwXSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKGQzLmV2ZW50LnNvdXJjZUV2ZW50ICYmIGQzLmV2ZW50LnNvdXJjZUV2ZW50LnRvU3RyaW5nKCkgPT09ICdbb2JqZWN0IFdoZWVsRXZlbnRdJykge1xuICAgICAgICAgICAgem9vbS5zY2FsZShkMy5ldmVudC5zY2FsZSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJlZHJhdygpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gaW5pdGlhbGl6YXRpb24gb2YgdGhlIGRlbGltaXRlclxuICAgICAgICBzdmcuc2VsZWN0KCcuZGVsaW1pdGVyJykucmVtb3ZlKCk7XG4gICAgICAgIHZhciBkZWxpbWl0ZXJFbCA9IHN2Z1xuICAgICAgICAgIC5hcHBlbmQoJ2cnKVxuICAgICAgICAgIC5jbGFzc2VkKCdkZWxpbWl0ZXInLCB0cnVlKVxuICAgICAgICAgIC5hdHRyKCd3aWR0aCcsIGdyYXBoV2lkdGgpXG4gICAgICAgICAgLmF0dHIoJ2hlaWdodCcsIDEwKVxuICAgICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCcgKyBjb25maWcubWFyZ2luLmxlZnQgKyAnLCAnICsgKGNvbmZpZy5tYXJnaW4udG9wIC0gNDUpICsgJyknKVxuICAgICAgICAgIC5jYWxsKGRlbGltaXRlcih7XG4gICAgICAgICAgICB4U2NhbGU6IHhTY2FsZSxcbiAgICAgICAgICAgIGRhdGVGb3JtYXQ6IGNvbmZpZy5sb2NhbGUgPyBjb25maWcubG9jYWxlLnRpbWVGb3JtYXQoXCIlZCAlQiAlWVwiKSA6IGQzLnRpbWUuZm9ybWF0KFwiJWQgJUIgJVlcIilcbiAgICAgICAgICB9KSlcbiAgICAgICAgO1xuXG4gICAgICAgIGZ1bmN0aW9uIHJlZHJhd0RlbGltaXRlcigpIHtcbiAgICAgICAgICBkZWxpbWl0ZXJFbC5jYWxsKGRlbGltaXRlcih7XG4gICAgICAgICAgICB4U2NhbGU6IHhTY2FsZSxcbiAgICAgICAgICAgIGRhdGVGb3JtYXQ6IGNvbmZpZy5sb2NhbGUgPyBjb25maWcubG9jYWxlLnRpbWVGb3JtYXQoXCIlZCAlQiAlWVwiKSA6IGQzLnRpbWUuZm9ybWF0KFwiJWQgJUIgJVlcIilcbiAgICAgICAgICB9KSk7XG4gICAgICAgIH1cblxuICBcdFx0XHRmdW5jdGlvbiB6b29tRW5kKCkge1xuICBcdFx0XHQgIGlmIChjb25maWcuZXZlbnRab29tKSB7XG4gIFx0XHRcdFx0ICBjb25maWcuZXZlbnRab29tKHhTY2FsZSk7XG4gIFx0XHRcdCAgfVxuICBcdFx0XHQgIGlmIChjb25maWcuaGFzRGVsaW1pdGVyKSB7XG4gIFx0XHRcdFx0ICByZWRyYXdEZWxpbWl0ZXIoKTtcbiAgXHRcdFx0ICB9XG4gIFx0XHRcdH1cblxuICAgICAgICB2YXIgaGFzVG9wQXhpcyA9IHR5cGVvZiBjb25maWcuaGFzVG9wQXhpcyA9PT0gJ2Z1bmN0aW9uJyA/IGNvbmZpZy5oYXNUb3BBeGlzKGRhdGEpIDogY29uZmlnLmhhc1RvcEF4aXM7XG4gICAgICAgIGlmIChoYXNUb3BBeGlzKSB7XG4gICAgICAgICAgeEF4aXNUb3AgPSB4QXhpc0ZhY3RvcnkoZDMsIGNvbmZpZywgeFNjYWxlLCBncmFwaCwgZ3JhcGhIZWlnaHQsICd0b3AnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBoYXNCb3R0b21BeGlzID0gdHlwZW9mIGNvbmZpZy5oYXNCb3R0b21BeGlzID09PSAnZnVuY3Rpb24nID8gY29uZmlnLmhhc0JvdHRvbUF4aXMoZGF0YSkgOiBjb25maWcuaGFzQm90dG9tQXhpcztcbiAgICAgICAgaWYgKGhhc0JvdHRvbUF4aXMpIHtcbiAgICAgICAgICB4QXhpc0JvdHRvbSA9IHhBeGlzRmFjdG9yeShkMywgY29uZmlnLCB4U2NhbGUsIGdyYXBoLCBncmFwaEhlaWdodCwgJ2JvdHRvbScpO1xuICAgICAgICB9XG5cbiAgXHRcdFx0ZnVuY3Rpb24gZHJhd1hBeGlzKHdoZXJlKSB7XG4gIFx0XHRcdCAgLy8gY29weSBjb25maWcudGlja0Zvcm1hdCBiZWNhdXNlIGQzIGZvcm1hdC5tdWx0aSBlZGl0IGl0cyBnaXZlbiB0aWNrRm9ybWF0IGRhdGFcbiAgXHRcdFx0ICB2YXIgdGlja0Zvcm1hdERhdGEgPSBbXTtcblxuICBcdFx0XHQgIGNvbmZpZy50aWNrRm9ybWF0LmZvckVhY2goZnVuY3Rpb24gKGl0ZW0pIHtcbiAgXHRcdFx0XHQgIHZhciB0aWNrID0gaXRlbS5zbGljZSgwKTtcbiAgXHRcdFx0XHQgIHRpY2tGb3JtYXREYXRhLnB1c2godGljayk7XG4gIFx0XHRcdCAgfSk7XG5cbiAgXHRcdFx0ICB2YXIgdGlja0Zvcm1hdCA9IGNvbmZpZy5sb2NhbGUgPyBjb25maWcubG9jYWxlLnRpbWVGb3JtYXQubXVsdGkodGlja0Zvcm1hdERhdGEpIDogZDMudGltZS5mb3JtYXQubXVsdGkodGlja0Zvcm1hdERhdGEpO1xuICBcdFx0XHQgIHZhciB4QXhpcyA9IGQzLnN2Zy5heGlzKClcbiAgXHRcdFx0XHQgIC5zY2FsZSh4U2NhbGUpXG4gIFx0XHRcdFx0ICAub3JpZW50KHdoZXJlKVxuICBcdFx0XHRcdCAgLnRpY2tGb3JtYXQodGlja0Zvcm1hdClcbiAgXHRcdFx0ICA7XG5cbiAgXHRcdFx0ICBpZiAodHlwZW9mIGNvbmZpZy5heGlzRm9ybWF0ID09PSAnZnVuY3Rpb24nKSB7XG4gIFx0XHRcdFx0ICBjb25maWcuYXhpc0Zvcm1hdCh4QXhpcyk7XG4gIFx0XHRcdCAgfVxuXG4gIFx0XHRcdCAgdmFyIHkgPSAod2hlcmUgPT0gJ2JvdHRvbScgPyBwYXJzZUludChncmFwaEhlaWdodCkgOiAwKSArIGNvbmZpZy5tYXJnaW4udG9wIC0gNDA7XG5cbiAgXHRcdFx0ICBncmFwaC5zZWxlY3QoJy54LWF4aXMuJyArIHdoZXJlKS5yZW1vdmUoKTtcbiAgXHRcdFx0ICB2YXIgeEF4aXNFbCA9IGdyYXBoXG4gICAgXHRcdFx0XHQuYXBwZW5kKCdnJylcbiAgICBcdFx0XHRcdC5jbGFzc2VkKCd4LWF4aXMnLCB0cnVlKVxuICAgIFx0XHRcdFx0LmNsYXNzZWQod2hlcmUsIHRydWUpXG4gICAgXHRcdFx0XHQuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgnICsgY29uZmlnLm1hcmdpbi5sZWZ0ICsgJywgJyArIHkgKyAnKScpXG4gICAgXHRcdFx0XHQuY2FsbCh4QXhpcylcbiAgXHRcdFx0ICA7XG4gIFx0XHRcdH1cblxuICBcdFx0XHQvLyBpbml0aWFsaXphdGlvbiBvZiB0aGUgZ3JhcGggYm9keVxuICAgICAgICB6b29tLnNpemUoW2NvbmZpZy53aWR0aCwgaGVpZ2h0XSk7XG5cbiAgICAgICAgZ3JhcGguc2VsZWN0KCcuZ3JhcGgtYm9keScpLnJlbW92ZSgpO1xuICAgICAgICB2YXIgZ3JhcGhCb2R5ID0gZ3JhcGhcbiAgICAgICAgICAuYXBwZW5kKCdnJylcbiAgICAgICAgICAuY2xhc3NlZCgnZ3JhcGgtYm9keScsIHRydWUpXG4gICAgICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoJyArIGNvbmZpZy5tYXJnaW4ubGVmdCArICcsICcgKyAoY29uZmlnLm1hcmdpbi50b3AgLSAxNSkgKyAnKScpO1xuXG4gICAgICAgIHZhciBsaW5lcyA9IGdyYXBoQm9keS5zZWxlY3RBbGwoJ2cnKS5kYXRhKGRhdGEpO1xuXG4gICAgICAgIGxpbmVzLmVudGVyKClcbiAgICAgICAgICAuYXBwZW5kKCdnJylcbiAgICAgICAgICAuY2xhc3NlZCgnbGluZScsIHRydWUpXG4gICAgICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsIGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICAgIHJldHVybiAndHJhbnNsYXRlKDAsJyArIHlTY2FsZShkLm5hbWUpICsgJyknO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLnN0eWxlKCdmaWxsJywgY29uZmlnLmV2ZW50TGluZUNvbG9yKVxuICAgICAgICAgIC5jYWxsKGV2ZW50TGluZSh7IHhTY2FsZTogeFNjYWxlLCBldmVudENvbG9yOiBjb25maWcuZXZlbnRDb2xvciB9KSlcbiAgICAgICAgO1xuXG4gICAgICAgIGxpbmVzLmV4aXQoKS5yZW1vdmUoKTtcblxuICAgICAgICBmdW5jdGlvbiByZWRyYXcoKSB7XG4gICAgICAgICAgLy8gU3RvcmUgdGhlIGN1cnJlbnQgdHJhbnNmb3JtYXRpb24gbWF0cml4XG4gICAgICAgICAgY3R4LnNhdmUoKTtcbiAgICAgICAgICAvLyBTZXQgYmFjayB0byB0aGUgb3JpZ2luYWwgY2FudmFzXG4gICAgICAgICAgY3R4LnNldFRyYW5zZm9ybSgxLCAwLCAwLCAxLCAwLCAwKTtcbiAgICAgICAgICAvLyBDbGVhciB0aGUgY2FudmFzXG4gICAgICAgICAgY3R4LmNsZWFyUmVjdCgwLCAwLCBncmFwaFdpZHRoLCBncmFwaEhlaWdodCk7XG4gICAgICAgICAgLy8gUmVzdG9yZSB0aGUgZm9ybWVyIGNvb3JkaW5hdGVzXG4gICAgICAgICAgY3R4LnJlc3RvcmUoKTtcblxuICAgICAgICAgIHZhciBoYXNUb3BBeGlzID0gdHlwZW9mIGNvbmZpZy5oYXNUb3BBeGlzID09PSAnZnVuY3Rpb24nID8gY29uZmlnLmhhc1RvcEF4aXMoZGF0YSkgOiBjb25maWcuaGFzVG9wQXhpcztcbiAgICAgICAgICBpZiAoaGFzVG9wQXhpcykge1xuICAgICAgICAgICAgeEF4aXNUb3AuZHJhd1hBeGlzKCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdmFyIGhhc0JvdHRvbUF4aXMgPSB0eXBlb2YgY29uZmlnLmhhc0JvdHRvbUF4aXMgPT09ICdmdW5jdGlvbicgPyBjb25maWcuaGFzQm90dG9tQXhpcyhkYXRhKSA6IGNvbmZpZy5oYXNCb3R0b21BeGlzO1xuICAgICAgICAgIGlmIChoYXNCb3R0b21BeGlzKSB7XG4gICAgICAgICAgICB4QXhpc0JvdHRvbS5kcmF3WEF4aXMoKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBsaW5lcy5jYWxsKGV2ZW50TGluZSh7IHhTY2FsZTogeFNjYWxlLCB5U2NhbGU6IHlTY2FsZSwgZXZlbnRMaW5lQ29sb3I6IGNvbmZpZy5ldmVudExpbmVDb2xvciwgZXZlbnRDb2xvcjogY29uZmlnLmV2ZW50Q29sb3IgfSkpO1xuXG4gICAgICAgICAgLy8gQXBwbHlpbmcgdGhlIGxpbmluZyBmaWx0ZXJcbiAgICAgICAgICBGaWx0ZXJGYWN0b3J5LmZpbHRlcigpO1xuICBcdFx0XHR9XG5cbiAgXHRcdFx0cmVkcmF3KCk7XG4gIFx0XHRcdGlmIChjb25maWcuaGFzRGVsaW1pdGVyKSB7XG4gIFx0XHRcdCAgcmVkcmF3RGVsaW1pdGVyKCk7XG4gIFx0XHRcdH1cbiAgXHRcdFx0aWYgKGNvbmZpZy5ldmVudFpvb20pIHtcbiAgXHRcdFx0ICBjb25maWcuZXZlbnRab29tKHhTY2FsZSk7XG4gIFx0XHRcdH1cblx0XHQgIH0pO1xuXHRcdH1cblx0XHRjb25maWd1cmFibGUoZXZlbnREcm9wR3JhcGgsIGNvbmZpZyk7XG5cblx0XHRyZXR1cm4gZXZlbnREcm9wR3JhcGg7XG4gIH07XG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vKiBnbG9iYWwgcmVxdWlyZSwgbW9kdWxlLCBkMyAqL1xuXG52YXIgY29uZmlndXJhYmxlID0gcmVxdWlyZSgnLi91dGlsL2NvbmZpZ3VyYWJsZScpO1xudmFyIGZpbHRlckRhdGEgPSByZXF1aXJlKCcuL2ZpbHRlckRhdGEnKTtcblxudmFyIGRlZmF1bHRDb25maWcgPSB7XG4gIHhTY2FsZTogbnVsbCxcbiAgeVNjYWxlOiBudWxsXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChkMywgY29udGV4dCkge1xuICByZXR1cm4gZnVuY3Rpb24gKGNvbmZpZykge1xuXG4gICAgY29uZmlnID0gY29uZmlnIHx8IHtcbiAgICAgIHhTY2FsZTogbnVsbCxcbiAgICAgIHlTY2FsZTogbnVsbCxcbiAgICAgIGV2ZW50TGluZUNvbG9yOiAnYmxhY2snLFxuICAgICAgd2lkdGg6IDAsXG4gICAgICBoZWlnaHQ6IDBcbiAgICB9O1xuICAgIGZvciAodmFyIGtleSBpbiBkZWZhdWx0Q29uZmlnKSB7XG4gICAgICBjb25maWdba2V5XSA9IGNvbmZpZ1trZXldIHx8IGRlZmF1bHRDb25maWdba2V5XTtcbiAgICB9XG5cbiAgICB2YXIgZXZlbnRMaW5lID0gZnVuY3Rpb24gZXZlbnRMaW5lKHNlbGVjdGlvbikge1xuICAgICAgc2VsZWN0aW9uLmVhY2goZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgZDMuc2VsZWN0KHRoaXMpLnNlbGVjdEFsbCgndGV4dCcpLnJlbW92ZSgpO1xuXG4gICAgICAgIGQzLnNlbGVjdCh0aGlzKS5hcHBlbmQoJ3RleHQnKVxuICAgICAgICAgIC50ZXh0KGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICAgIHZhciBjb3VudCA9IGZpbHRlckRhdGEoZC5kYXRlcywgY29uZmlnLnhTY2FsZSkubGVuZ3RoO1xuICAgICAgICAgICAgcmV0dXJuIGQubmFtZSArIChjb3VudCA+IDAgPyAnICgnICsgY291bnQgKyAnKScgOiAnJyk7XG4gICAgICAgICAgfSlcbiAgICAgICAgICAuYXR0cigndGV4dC1hbmNob3InLCAnZW5kJylcbiAgICAgICAgICAuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgtMjApJylcbiAgICAgICAgICAuc3R5bGUoJ2ZpbGwnLCAnYmxhY2snKVxuICAgICAgICA7XG5cbiAgICAgICAgdmFyIGRhdGFDb250YWluZXIgPSBkMy5zZWxlY3QoXCJib2R5XCIpLmFwcGVuZCgnY3VzdG9tJyk7XG5cbiAgICAgICAgZnVuY3Rpb24gaGV4VG9SZ2IoaGV4LCBhbHBoYSkge1xuICAgICAgICAgIHZhciByZXN1bHQgPSAvXiM/KFthLWZcXGRdezJ9KShbYS1mXFxkXXsyfSkoW2EtZlxcZF17Mn0pJC9pLmV4ZWMoaGV4KTtcbiAgICAgICAgICB2YXIgdG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgIGlmICghdGhpcy5hbHBoYSkge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIFwicmdiKFwiICsgdGhpcy5yICsgXCIsIFwiICsgdGhpcy5nICsgXCIsIFwiICsgdGhpcy5iICsgXCIpXCI7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgaWYgKHRoaXMuYWxwaGEgPiAxKSB7XG4gICAgICAgICAgICAgICAgICB0aGlzLmFscGhhID0gMTtcbiAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmFscGhhIDwgMCkge1xuICAgICAgICAgICAgICAgICAgdGhpcy5hbHBoYSA9IDA7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmV0dXJuIFwicmdiYShcIiArIHRoaXMuciArIFwiLCBcIiArIHRoaXMuZyArIFwiLCBcIiArIHRoaXMuYiArIFwiLCBcIiArIHRoaXMuYWxwaGEgKyBcIilcIjtcbiAgICAgICAgICB9O1xuICAgICAgICAgIGlmICghYWxwaGEpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdCA/IHtcbiAgICAgICAgICAgICAgICAgIHI6IHBhcnNlSW50KHJlc3VsdFsxXSwgMTYpLFxuICAgICAgICAgICAgICAgICAgZzogcGFyc2VJbnQocmVzdWx0WzJdLCAxNiksXG4gICAgICAgICAgICAgICAgICBiOiBwYXJzZUludChyZXN1bHRbM10sIDE2KSxcbiAgICAgICAgICAgICAgICAgIHRvU3RyaW5nOiB0b1N0cmluZ1xuICAgICAgICAgICAgICB9IDogbnVsbDtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGFscGhhID4gMSkge1xuICAgICAgICAgICAgICBhbHBoYSA9IDE7XG4gICAgICAgICAgfSBlbHNlIGlmIChhbHBoYSA8IDApIHtcbiAgICAgICAgICAgICAgYWxwaGEgPSAwO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gcmVzdWx0ID8ge1xuICAgICAgICAgICAgICByOiBwYXJzZUludChyZXN1bHRbMV0sIDE2KSxcbiAgICAgICAgICAgICAgZzogcGFyc2VJbnQocmVzdWx0WzJdLCAxNiksXG4gICAgICAgICAgICAgIGI6IHBhcnNlSW50KHJlc3VsdFszXSwgMTYpLFxuICAgICAgICAgICAgICBhbHBoYTogYWxwaGEsXG4gICAgICAgICAgICAgIHRvU3RyaW5nOiB0b1N0cmluZ1xuICAgICAgICAgIH0gOiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gZHJhd0N1c3RvbSAoZGF0YSkge1xuICAgICAgICAgIHZhciBkYXRlcyA9IGZpbHRlckRhdGEoZGF0YS5kYXRlcywgY29uZmlnLnhTY2FsZSk7XG4gICAgICAgICAgdmFyIHkgPSAwO1xuICAgICAgICAgIGlmICh0eXBlb2YgY29uZmlnLnlTY2FsZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgeSA9IGNvbmZpZy55U2NhbGUoZGF0YS5uYW1lKSArIDI1O1xuICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgeSA9IGNvbmZpZy55U2NhbGUgKyAyNTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdmFyIGNvbG9yID0gJ2JsYWNrJztcbiAgICAgICAgICBpZiAoY29uZmlnLmV2ZW50TGluZUNvbG9yKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGNvbmZpZy5ldmVudExpbmVDb2xvciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICBjb2xvciA9IGNvbmZpZy5ldmVudExpbmVDb2xvcihkYXRhLCBkYXRhLm5hbWUpO1xuICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgIGNvbG9yID0gY29uZmlnLmV2ZW50TGluZUNvbG9yO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIHZhciBkYXRlVGFiID0gZGF0ZXMuc29ydChmdW5jdGlvbihhLCBiKSB7XG4gICAgICAgICAgICByZXR1cm4gYSAtIGI7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICB2YXIgcG9pbnRzID0gW107XG4gICAgICAgICAgdmFyIGluZGV4ID0gMDtcblxuICAgICAgICAgIHZhciBjb2xvcnMgPSBoZXhUb1JnYihjb2xvciwgMSk7XG5cbiAgICAgICAgICBpZiAoY29udGV4dCkge1xuICAgICAgICAgICAgZHJhd0xpbmUoZGF0ZVRhYiwgeSwgY29sb3JzLCBjb250ZXh0LCBwb2ludHMpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGRyYXdMaW5lKGRhdGVzLCBjb29yWSwgY29sb3JzLCBjb250ZXh0LCBwb2ludHMpIHtcbiAgICAgICAgICBkYXRlcy5mb3JFYWNoKGZ1bmN0aW9uKGRhdGUpIHtcbiAgICAgICAgICAgIHZhciB4ID0gY29uZmlnLnhTY2FsZShkYXRlKSxcbiAgICAgICAgICAgICAgICB5ID0gY29vclksXG4gICAgICAgICAgICAgICAgc2l6ZSA9IDE1O1xuXG4gICAgICAgICAgICAgICAgcG9pbnRzLnB1c2goe3g6eCx5Onksc2l6ZTpzaXplfSk7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICBmdW5jdGlvbiB1cGRhdGUoKSB7XG4gICAgICAgICAgICB2YXIgbGVuID0gcG9pbnRzLmxlbmd0aDtcbiAgICAgICAgICAgIHdoaWxlIChsZW4tLSkge1xuICAgICAgICAgICAgICB2YXIgcG9pbnQgPSBwb2ludHNbbGVuXTtcblxuICAgICAgICAgICAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgICAgICAgICAgICB2YXIgZ3JhZCA9IGNvbnRleHQuY3JlYXRlUmFkaWFsR3JhZGllbnQocG9pbnQueCwgcG9pbnQueSwgMSwgcG9pbnQueCwgcG9pbnQueSwgcG9pbnQuc2l6ZSk7XG4gICAgICAgICAgICAgIGlmIChjb2xvcnMpIHtcbiAgICAgICAgICAgICAgICBncmFkLmFkZENvbG9yU3RvcCgwLCAncmdiYSgnICsgY29sb3JzLnIgKycsJyArIGNvbG9ycy5nICsgJywnICsgY29sb3JzLmIgKyAnLDEpJyk7XG4gICAgICAgICAgICAgICAgZ3JhZC5hZGRDb2xvclN0b3AoMSwgJ3JnYmEoJyArIGNvbG9ycy5yICsnLCcgKyBjb2xvcnMuZyArICcsJyArIGNvbG9ycy5iICsgJywwKScpO1xuICAgICAgICAgICAgICAgIGNvbnRleHQuZmlsbFN0eWxlID0gZ3JhZDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBjb250ZXh0LmFyYyhwb2ludC54LCBwb2ludC55LCBwb2ludC5zaXplLCAwLCBNYXRoLlBJKjIpO1xuICAgICAgICAgICAgICBjb250ZXh0LmZpbGwoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG1ldGFiYWxpemUoKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBmdW5jdGlvbiBtZXRhYmFsaXplKCkge1xuICAgICAgICAgICAgdmFyIHRocmVzaG9sZCA9IDE4MDtcbiAgICAgICAgICAgIHZhciBpbWFnZURhdGEgPSBjb250ZXh0LmdldEltYWdlRGF0YSgwLDAsY29uZmlnLndpZHRoLGNvbmZpZy5oZWlnaHQpLFxuICAgICAgICAgICAgcGl4ID0gaW1hZ2VEYXRhLmRhdGE7XG5cbiAgICAgICAgICAgIHZhciBhbHBoYTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBuID0gcGl4Lmxlbmd0aDsgaSA8IG47IGkgKz0gNCkge1xuICAgICAgICAgICAgICAgIGFscGhhID0gcGl4W2krM107XG4gICAgICAgICAgICAgICAgaWYoYWxwaGEgPCB0aHJlc2hvbGQpe1xuICAgICAgICAgICAgICAgICAgICBhbHBoYSA9IDA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHBpeFtpICsgM10gPSBhbHBoYSA9PT0gMCA/IDAgOiAyNTU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnRleHQucHV0SW1hZ2VEYXRhKGltYWdlRGF0YSwgMCwgMCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdXBkYXRlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBkcmF3Q3VzdG9tKGRhdGEpO1xuICAgICAgfSk7XG4gICAgfTtcblxuICAgIGNvbmZpZ3VyYWJsZShldmVudExpbmUsIGNvbmZpZyk7XG5cbiAgICByZXR1cm4gZXZlbnRMaW5lO1xuICB9O1xufTtcbiIsIlwidXNlIHN0cmljdFwiO1xuLyogZ2xvYmFsIG1vZHVsZSAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGZpbHRlckRhdGUoZGF0YSwgc2NhbGUpIHtcbiAgZGF0YSA9IGRhdGEgfHwgW107XG4gIHZhciBib3VuZGFyeSA9IHNjYWxlLnJhbmdlKCk7XG4gIHZhciBtaW4gPSBib3VuZGFyeVswXTtcbiAgdmFyIG1heCA9IGJvdW5kYXJ5WzFdO1xuXG4gIHJldHVybiBkYXRhLmZpbHRlcihmdW5jdGlvbiAoZGF0dW0pIHtcbiAgICB2YXIgdmFsdWUgPSBzY2FsZShkYXR1bSk7XG4gICAgcmV0dXJuICEodmFsdWUgPCBtaW4gfHwgdmFsdWUgPiBtYXgpO1xuICB9KTtcbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcbi8qIGdsb2JhbCByZXF1aXJlLCBtb2R1bGUgKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY3R4KSB7XG5cbiAgdmFyIEZpbHRlcnMgPSB7fTtcbiAgRmlsdGVycy5nZXRQaXhlbHMgPSBmdW5jdGlvbihjdHgpIHtcbiAgICByZXR1cm4gY3R4LmdldEltYWdlRGF0YSgwLDAsODAwLDYwMCk7XG4gIH07XG5cbiAgRmlsdGVycy5maWx0ZXJJbWFnZSA9IGZ1bmN0aW9uKGZpbHRlciwgY3R4LCB2YXJfYXJncykge1xuICAgIHZhciBhcmdzID0gW3RoaXMuZ2V0UGl4ZWxzKGN0eCldO1xuICAgIGZvciAodmFyIGk9MjsgaTxhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGFyZ3MucHVzaChhcmd1bWVudHNbaV0pO1xuICAgIH1cbiAgICByZXR1cm4gZmlsdGVyLmFwcGx5KG51bGwsIGFyZ3MpO1xuICB9O1xuXG4gIEZpbHRlcnMuY3JlYXRlSW1hZ2VEYXRhID0gZnVuY3Rpb24odyxoKSB7XG4gICAgcmV0dXJuIGN0eC5jcmVhdGVJbWFnZURhdGEodyxoKTtcbiAgfTtcblxuICBGaWx0ZXJzLmNvbnZvbHV0ZSA9IGZ1bmN0aW9uKHBpeGVscywgd2VpZ2h0cywgb3BhcXVlKSB7XG4gICAgdmFyIHNpZGUgPSBNYXRoLnJvdW5kKE1hdGguc3FydCh3ZWlnaHRzLmxlbmd0aCkpO1xuICAgIHZhciBoYWxmU2lkZSA9IE1hdGguZmxvb3Ioc2lkZS8yKTtcbiAgICB2YXIgc3JjID0gcGl4ZWxzLmRhdGE7XG4gICAgdmFyIHN3ID0gcGl4ZWxzLndpZHRoO1xuICAgIHZhciBzaCA9IHBpeGVscy5oZWlnaHQ7XG4gICAgLy8gcGFkIG91dHB1dCBieSB0aGUgY29udm9sdXRpb24gbWF0cml4XG4gICAgdmFyIHcgPSBzdztcbiAgICB2YXIgaCA9IHNoO1xuICAgIHZhciBvdXRwdXQgPSBGaWx0ZXJzLmNyZWF0ZUltYWdlRGF0YSg4MDAsIDYwMCk7XG4gICAgdmFyIGRzdCA9IG91dHB1dC5kYXRhO1xuICAgIC8vIGdvIHRocm91Z2ggdGhlIGRlc3RpbmF0aW9uIGltYWdlIHBpeGVsc1xuICAgIGZvciAodmFyIHk9MDsgeTxoOyB5KyspIHtcbiAgICAgIGZvciAodmFyIHg9MDsgeDx3OyB4KyspIHtcbiAgICAgICAgdmFyIHN5ID0geTtcbiAgICAgICAgdmFyIHN4ID0geDtcbiAgICAgICAgdmFyIGRzdE9mZiA9ICh5KncreCkqNDtcbiAgICAgICAgLy8gY2FsY3VsYXRlIHRoZSB3ZWlnaGVkIHN1bSBvZiB0aGUgc291cmNlIGltYWdlIHBpeGVscyB0aGF0XG4gICAgICAgIC8vIGZhbGwgdW5kZXIgdGhlIGNvbnZvbHV0aW9uIG1hdHJpeFxuICAgICAgICB2YXIgcj0wLCBnPTAsIGI9MCwgYT0wO1xuICAgICAgICBmb3IgKHZhciBjeT0wOyBjeTxzaWRlOyBjeSsrKSB7XG4gICAgICAgICAgZm9yICh2YXIgY3g9MDsgY3g8c2lkZTsgY3grKykge1xuICAgICAgICAgICAgdmFyIHNjeSA9IHN5ICsgY3kgLSBoYWxmU2lkZTtcbiAgICAgICAgICAgIHZhciBzY3ggPSBzeCArIGN4IC0gaGFsZlNpZGU7XG4gICAgICAgICAgICBpZiAoc2N5ID49IDAgJiYgc2N5IDwgc2ggJiYgc2N4ID49IDAgJiYgc2N4IDwgc3cpIHtcbiAgICAgICAgICAgICAgdmFyIHNyY09mZiA9IChzY3kqc3crc2N4KSo0O1xuICAgICAgICAgICAgICB2YXIgd3QgPSB3ZWlnaHRzW2N5KnNpZGUrY3hdO1xuICAgICAgICAgICAgICByICs9IHNyY1tzcmNPZmZdICogd3Q7XG4gICAgICAgICAgICAgIGcgKz0gc3JjW3NyY09mZisxXSAqIHd0O1xuICAgICAgICAgICAgICBiICs9IHNyY1tzcmNPZmYrMl0gKiB3dDtcbiAgICAgICAgICAgICAgYSArPSBzcmNbc3JjT2ZmKzNdICogd3Q7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGRzdFtkc3RPZmZdID0gcjtcbiAgICAgICAgZHN0W2RzdE9mZisxXSA9IGc7XG4gICAgICAgIGRzdFtkc3RPZmYrMl0gPSBiO1xuICAgICAgICBkc3RbZHN0T2ZmKzNdID0gYTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG91dHB1dDtcbiAgfTtcblxuICB2YXIgZmlsdGVyID0gZnVuY3Rpb24gZmlsdGVyKCkge1xuICAgIHZhciByZXN1bHQgPSBGaWx0ZXJzLmZpbHRlckltYWdlKEZpbHRlcnMuY29udm9sdXRlLCBjdHgsXG4gICAgWyAxLzksIDEvOSwgMS85LFxuICAgICAgMS85LCAxLzksIDEvOSxcbiAgICAgIDEvOSwgMS85LCAxLzkgXVxuICAgICk7XG5cbiAgICBjdHgucHV0SW1hZ2VEYXRhKHJlc3VsdCwgMCwgMCk7XG4gIH07XG5cbiAgcmV0dXJuIHtcbiAgICBmaWx0ZXI6IGZpbHRlclxuICB9O1xufTtcbiIsIlwidXNlIHN0cmljdFwiO1xuLyogZ2xvYmFsIHJlcXVpcmUsIGRlZmluZSwgbW9kdWxlICovXG5cbnZhciBldmVudERyb3BzID0gcmVxdWlyZSgnLi9ldmVudERyb3BzJyk7XG5cbmlmICh0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCkge1xuICBkZWZpbmUoJ2QzLmNoYXJ0LmV2ZW50RHJvcHMnLCBbXCJkM1wiXSwgZnVuY3Rpb24gKGQzKSB7XG4gICAgZDMuY2hhcnQgPSBkMy5jaGFydCB8fCB7fTtcbiAgICBkMy5jaGFydC5ldmVudERyb3BzID0gZXZlbnREcm9wcyhkMywgZG9jdW1lbnQpO1xuICB9KTtcbn0gZWxzZSBpZiAod2luZG93KSB7XG4gIHdpbmRvdy5kMy5jaGFydCA9IHdpbmRvdy5kMy5jaGFydCB8fCB7fTtcbiAgd2luZG93LmQzLmNoYXJ0LmV2ZW50RHJvcHMgPSBldmVudERyb3BzKHdpbmRvdy5kMywgZG9jdW1lbnQpO1xufSBlbHNlIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBldmVudERyb3BzO1xufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjb25maWd1cmFibGUodGFyZ2V0RnVuY3Rpb24sIGNvbmZpZywgbGlzdGVuZXJzKSB7XG4gIGxpc3RlbmVycyA9IGxpc3RlbmVycyB8fCB7fTtcbiAgZm9yICh2YXIgaXRlbSBpbiBjb25maWcpIHtcbiAgICAoZnVuY3Rpb24oaXRlbSkge1xuICAgICAgdGFyZ2V0RnVuY3Rpb25baXRlbV0gPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBjb25maWdbaXRlbV07XG4gICAgICAgIGNvbmZpZ1tpdGVtXSA9IHZhbHVlO1xuICAgICAgICBpZiAobGlzdGVuZXJzLmhhc093blByb3BlcnR5KGl0ZW0pKSB7XG4gICAgICAgICAgbGlzdGVuZXJzW2l0ZW1dKHZhbHVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0YXJnZXRGdW5jdGlvbjtcbiAgICAgIH07XG4gICAgfSkoaXRlbSk7IC8vIGZvciBkb2Vzbid0IGNyZWF0ZSBhIGNsb3N1cmUsIGZvcmNpbmcgaXRcbiAgfVxufTtcbiIsIlxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChkMywgY29uZmlnLCB4U2NhbGUsIGdyYXBoLCBncmFwaEhlaWdodCwgd2hlcmUpIHtcbiAgdmFyIHhBeGlzID0ge307XG4gIHZhciB4QXhpc0VscyA9IHt9O1xuXG4gIHZhciB0aWNrRm9ybWF0RGF0YSA9IFtdO1xuXG4gIGNvbmZpZy50aWNrRm9ybWF0LmZvckVhY2goZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICB2YXIgdGljayA9IGl0ZW0uc2xpY2UoMCk7XG4gICAgdGlja0Zvcm1hdERhdGEucHVzaCh0aWNrKTtcbiAgfSk7XG5cbiAgdmFyIHRpY2tGb3JtYXQgPSBjb25maWcubG9jYWxlID8gY29uZmlnLmxvY2FsZS50aW1lRm9ybWF0Lm11bHRpKHRpY2tGb3JtYXREYXRhKSA6IGQzLnRpbWUuZm9ybWF0Lm11bHRpKHRpY2tGb3JtYXREYXRhKTtcbiAgeEF4aXNbd2hlcmVdID0gZDMuc3ZnLmF4aXMoKVxuICAgIC5zY2FsZSh4U2NhbGUpXG4gICAgLm9yaWVudCh3aGVyZSlcbiAgICAudGlja0Zvcm1hdCh0aWNrRm9ybWF0KVxuICA7XG5cbiAgaWYgKHR5cGVvZiBjb25maWcuYXhpc0Zvcm1hdCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGNvbmZpZy5heGlzRm9ybWF0KHhBeGlzKTtcbiAgfVxuXG4gIHZhciB5ID0gKHdoZXJlID09ICdib3R0b20nID8gcGFyc2VJbnQoZ3JhcGhIZWlnaHQpIDogMCkgKyBjb25maWcubWFyZ2luLnRvcCAtIDQwO1xuXG4gIHhBeGlzRWxzW3doZXJlXSA9IGdyYXBoXG4gICAgLmFwcGVuZCgnZycpXG4gICAgLmNsYXNzZWQoJ3gtYXhpcycsIHRydWUpXG4gICAgLmNsYXNzZWQod2hlcmUsIHRydWUpXG4gICAgLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoJyArIGNvbmZpZy5tYXJnaW4ubGVmdCArICcsICcgKyB5ICsgJyknKVxuICAgIC5jYWxsKHhBeGlzW3doZXJlXSlcbiAgO1xuXG4gIHZhciBkcmF3WEF4aXMgPSBmdW5jdGlvbiBkcmF3WEF4aXMoKSB7XG4gICAgeEF4aXNFbHNbd2hlcmVdXG4gICAgICAuY2FsbCh4QXhpc1t3aGVyZV0pXG4gICAgO1xuICB9O1xuXG4gIHJldHVybiB7XG4gICAgZHJhd1hBeGlzOiBkcmF3WEF4aXNcbiAgfTtcbn07XG4iXX0=
