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

},{"./util/configurable":8}],2:[function(require,module,exports){
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

        var base = d3.select(this);

				base.select('canvas').remove();
  			var canvas = base
  			  .append('canvas')
  			  .attr('id', "mon_canvas")
  			  .attr('width', graphWidth)
  			  .attr('height', graphHeight);

  		  var ctx = (canvas.node()).getContext('2d');

        var eventLine = require('./eventLine')(d3, ctx);
        var FilterFactory = require('./filterLining')(ctx);

  			base.select('svg').remove();

  			var svg = base
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

          // Applying the lining filter to the canvas
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

},{"./delimiter":1,"./eventLine":3,"./filterData":4,"./filterLining":5,"./util/configurable":8,"./xAxis":9}],3:[function(require,module,exports){
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

        var MetaballFactory = require('./metabalizingTools')(context, config, filterData);

        MetaballFactory.drawCustom(data);
      });
    };

    configurable(eventLine, config);

    return eventLine;
  };
};

},{"./filterData":4,"./metabalizingTools":7,"./util/configurable":8}],4:[function(require,module,exports){
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
"use strict";
/* global require, module */

module.exports = function (context, config, filterData) {

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

  var drawCustom = function drawCustom (data) {
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
  };

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

  return {
    drawCustom: drawCustom
  };
};

},{}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){


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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwibGliL2RlbGltaXRlci5qcyIsImxpYi9ldmVudERyb3BzLmpzIiwibGliL2V2ZW50TGluZS5qcyIsImxpYi9maWx0ZXJEYXRhLmpzIiwibGliL2ZpbHRlckxpbmluZy5qcyIsImxpYi9tYWluLmpzIiwibGliL21ldGFiYWxpemluZ1Rvb2xzLmpzIiwibGliL3V0aWwvY29uZmlndXJhYmxlLmpzIiwibGliL3hBeGlzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlwidXNlIHN0cmljdFwiO1xuLyogZ2xvYmFsIHJlcXVpcmUsIG1vZHVsZSwgZDMgKi9cblxudmFyIGNvbmZpZ3VyYWJsZSA9IHJlcXVpcmUoJy4vdXRpbC9jb25maWd1cmFibGUnKTtcblxudmFyIGRlZmF1bHRDb25maWcgPSB7XG4gIHhTY2FsZTogbnVsbCxcbiAgZGF0ZUZvcm1hdDogbnVsbFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZDMpIHtcblxuICByZXR1cm4gZnVuY3Rpb24gKGNvbmZpZykge1xuXG4gICAgY29uZmlnID0gY29uZmlnIHx8IHt9O1xuICAgIGZvciAodmFyIGtleSBpbiBkZWZhdWx0Q29uZmlnKSB7XG4gICAgICBjb25maWdba2V5XSA9IGNvbmZpZ1trZXldIHx8IGRlZmF1bHRDb25maWdba2V5XTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBkZWxpbWl0ZXIoc2VsZWN0aW9uKSB7XG4gICAgICBzZWxlY3Rpb24uZWFjaChmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICBkMy5zZWxlY3QodGhpcykuc2VsZWN0QWxsKCd0ZXh0JykucmVtb3ZlKCk7XG5cbiAgICAgICAgdmFyIGxpbWl0cyA9IGNvbmZpZy54U2NhbGUuZG9tYWluKCk7XG5cbiAgICAgICAgZDMuc2VsZWN0KHRoaXMpLmFwcGVuZCgndGV4dCcpXG4gICAgICAgICAgLnRleHQoZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICByZXR1cm4gY29uZmlnLmRhdGVGb3JtYXQobGltaXRzWzBdKTtcbiAgICAgICAgICB9KVxuICAgICAgICAgIC5jbGFzc2VkKCdzdGFydCcsIHRydWUpXG4gICAgICAgIDtcblxuICAgICAgICBkMy5zZWxlY3QodGhpcykuYXBwZW5kKCd0ZXh0JylcbiAgICAgICAgICAudGV4dChmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgIHJldHVybiBjb25maWcuZGF0ZUZvcm1hdChsaW1pdHNbMV0pO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLmF0dHIoJ3RleHQtYW5jaG9yJywgJ2VuZCcpXG4gICAgICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoJyArIGNvbmZpZy54U2NhbGUucmFuZ2UoKVsxXSArICcpJylcbiAgICAgICAgICAuY2xhc3NlZCgnZW5kJywgdHJ1ZSlcbiAgICAgICAgO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgY29uZmlndXJhYmxlKGRlbGltaXRlciwgY29uZmlnKTtcblxuICAgIHJldHVybiBkZWxpbWl0ZXI7XG4gIH07XG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vKiBnbG9iYWwgcmVxdWlyZSwgbW9kdWxlICovXG5cbnZhciBjb25maWd1cmFibGUgPSByZXF1aXJlKCcuL3V0aWwvY29uZmlndXJhYmxlJyk7XG52YXIgeEF4aXNGYWN0b3J5ID0gcmVxdWlyZSgnLi94QXhpcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChkMywgZG9jdW1lbnQpIHtcbiAgdmFyIGRlbGltaXRlciA9IHJlcXVpcmUoJy4vZGVsaW1pdGVyJykoZDMpO1xuICB2YXIgZmlsdGVyRGF0YSA9IHJlcXVpcmUoJy4vZmlsdGVyRGF0YScpO1xuXG4gIHZhciBkZWZhdWx0Q29uZmlnID0ge1xuXHRcdHN0YXJ0OiBuZXcgRGF0ZSgwKSxcblx0XHRlbmQ6IG5ldyBEYXRlKCksXG5cdFx0bWluU2NhbGU6IDAsXG5cdFx0bWF4U2NhbGU6IEluZmluaXR5LFxuXHRcdHdpZHRoOiAxMDAwLFxuXHRcdG1hcmdpbjoge1xuXHRcdCAgdG9wOiA2MCxcblx0XHQgIGxlZnQ6IDIwMCxcblx0XHQgIGJvdHRvbTogNDAsXG5cdFx0ICByaWdodDogNTBcblx0XHR9LFxuXHRcdGxvY2FsZTogbnVsbCxcblx0XHRheGlzRm9ybWF0OiBudWxsLFxuXHRcdHRpY2tGb3JtYXQ6IFtcblx0XHRcdFtcIi4lTFwiLCBmdW5jdGlvbihkKSB7IHJldHVybiBkLmdldE1pbGxpc2Vjb25kcygpOyB9XSxcblx0XHRcdFtcIjolU1wiLCBmdW5jdGlvbihkKSB7IHJldHVybiBkLmdldFNlY29uZHMoKTsgfV0sXG5cdFx0XHRbXCIlSTolTVwiLCBmdW5jdGlvbihkKSB7IHJldHVybiBkLmdldE1pbnV0ZXMoKTsgfV0sXG5cdFx0XHRbXCIlSSAlcFwiLCBmdW5jdGlvbihkKSB7IHJldHVybiBkLmdldEhvdXJzKCk7IH1dLFxuXHRcdFx0W1wiJWEgJWRcIiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gZC5nZXREYXkoKSAmJiBkLmdldERhdGUoKSAhPSAxOyB9XSxcblx0XHRcdFtcIiViICVkXCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQuZ2V0RGF0ZSgpICE9IDE7IH1dLFxuXHRcdFx0W1wiJUJcIiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gZC5nZXRNb250aCgpOyB9XSxcblx0XHRcdFtcIiVZXCIsIGZ1bmN0aW9uKCkgeyByZXR1cm4gdHJ1ZTsgfV1cblx0XHRdLFxuXHRcdGV2ZW50SG92ZXI6IG51bGwsXG5cdFx0ZXZlbnRab29tOiBudWxsLFxuXHRcdGV2ZW50Q2xpY2s6IG51bGwsXG5cdFx0aGFzRGVsaW1pdGVyOiB0cnVlLFxuXHRcdGhhc1RvcEF4aXM6IHRydWUsXG5cdFx0aGFzQm90dG9tQXhpczogZnVuY3Rpb24gKGRhdGEpIHtcblx0XHQgIHJldHVybiBkYXRhLmxlbmd0aCA+PSAxMDtcblx0XHR9LFxuXHRcdGV2ZW50TGluZUNvbG9yOiAnYmxhY2snLFxuXHRcdGV2ZW50Q29sb3I6IG51bGxcbiAgfTtcblxuICByZXR1cm4gZnVuY3Rpb24gZXZlbnREcm9wcyhjb25maWcpIHtcblx0XHR2YXIgeFNjYWxlID0gZDMudGltZS5zY2FsZSgpO1xuXHRcdHZhciB5U2NhbGUgPSBkMy5zY2FsZS5vcmRpbmFsKCk7XG5cdFx0Y29uZmlnID0gY29uZmlnIHx8IHt9O1xuXHRcdGZvciAodmFyIGtleSBpbiBkZWZhdWx0Q29uZmlnKSB7XG5cdFx0ICBjb25maWdba2V5XSA9IGNvbmZpZ1trZXldIHx8IGRlZmF1bHRDb25maWdba2V5XTtcblx0XHR9XG5cblx0XHRmdW5jdGlvbiBldmVudERyb3BHcmFwaChzZWxlY3Rpb24pIHtcblx0XHQgIHNlbGVjdGlvbi5lYWNoKGZ1bmN0aW9uIChkYXRhKSB7XG5cdFx0XHRcdHZhciB6b29tID0gZDMuYmVoYXZpb3Iuem9vbSgpLmNlbnRlcihudWxsKS5zY2FsZUV4dGVudChbY29uZmlnLm1pblNjYWxlLCBjb25maWcubWF4U2NhbGVdKS5vbihcInpvb21cIiwgdXBkYXRlWm9vbSk7XG5cdFx0XHRcdHpvb20ub24oXCJ6b29tZW5kXCIsIHpvb21FbmQpO1xuXG4gICAgICAgIHZhciBncmFwaFdpZHRoID0gY29uZmlnLndpZHRoIC0gY29uZmlnLm1hcmdpbi5yaWdodCAtIGNvbmZpZy5tYXJnaW4ubGVmdDtcbiAgICAgICAgdmFyIGdyYXBoSGVpZ2h0ID0gZGF0YS5sZW5ndGggKiA0MDtcbiAgICAgICAgdmFyIGhlaWdodCA9IGdyYXBoSGVpZ2h0ICsgY29uZmlnLm1hcmdpbi50b3AgKyBjb25maWcubWFyZ2luLmJvdHRvbTtcbiAgICAgICAgdmFyIHhBeGlzVG9wLCB4QXhpc0JvdHRvbTtcblxuICAgICAgICB2YXIgYmFzZSA9IGQzLnNlbGVjdCh0aGlzKTtcblxuXHRcdFx0XHRiYXNlLnNlbGVjdCgnY2FudmFzJykucmVtb3ZlKCk7XG4gIFx0XHRcdHZhciBjYW52YXMgPSBiYXNlXG4gIFx0XHRcdCAgLmFwcGVuZCgnY2FudmFzJylcbiAgXHRcdFx0ICAuYXR0cignaWQnLCBcIm1vbl9jYW52YXNcIilcbiAgXHRcdFx0ICAuYXR0cignd2lkdGgnLCBncmFwaFdpZHRoKVxuICBcdFx0XHQgIC5hdHRyKCdoZWlnaHQnLCBncmFwaEhlaWdodCk7XG5cbiAgXHRcdCAgdmFyIGN0eCA9IChjYW52YXMubm9kZSgpKS5nZXRDb250ZXh0KCcyZCcpO1xuXG4gICAgICAgIHZhciBldmVudExpbmUgPSByZXF1aXJlKCcuL2V2ZW50TGluZScpKGQzLCBjdHgpO1xuICAgICAgICB2YXIgRmlsdGVyRmFjdG9yeSA9IHJlcXVpcmUoJy4vZmlsdGVyTGluaW5nJykoY3R4KTtcblxuICBcdFx0XHRiYXNlLnNlbGVjdCgnc3ZnJykucmVtb3ZlKCk7XG5cbiAgXHRcdFx0dmFyIHN2ZyA9IGJhc2VcbiAgXHRcdFx0ICAuYXBwZW5kKCdzdmcnKVxuICBcdFx0XHQgIC5hdHRyKCd3aWR0aCcsIGNvbmZpZy53aWR0aClcbiAgXHRcdFx0ICAuYXR0cignaGVpZ2h0JywgaGVpZ2h0KVxuICBcdFx0XHQ7XG5cbiAgXHRcdFx0dmFyIGdyYXBoID0gc3ZnLmFwcGVuZCgnZycpXG4gIFx0XHRcdCAgLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoMCwgMjUpJyk7XG5cbiAgXHRcdFx0dmFyIHlEb21haW4gPSBbXTtcbiAgXHRcdFx0dmFyIHlSYW5nZSA9IFtdO1xuXG4gIFx0XHRcdGRhdGEuZm9yRWFjaChmdW5jdGlvbiAoZXZlbnQsIGluZGV4KSB7XG4gIFx0XHRcdCAgeURvbWFpbi5wdXNoKGV2ZW50Lm5hbWUpO1xuICBcdFx0XHQgIHlSYW5nZS5wdXNoKGluZGV4ICogNDApO1xuICBcdFx0XHR9KTtcblxuICBcdFx0XHR5U2NhbGUuZG9tYWluKHlEb21haW4pLnJhbmdlKHlSYW5nZSk7XG5cbiAgXHRcdFx0dmFyIHlBeGlzRWwgPSBncmFwaC5hcHBlbmQoJ2cnKVxuICBcdFx0XHQgIC5jbGFzc2VkKCd5LWF4aXMnLCB0cnVlKVxuICBcdFx0XHQgIC5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKDAsIDYwKScpO1xuXG4gIFx0XHRcdHZhciB5VGljayA9IHlBeGlzRWwuYXBwZW5kKCdnJykuc2VsZWN0QWxsKCdnJykuZGF0YSh5RG9tYWluKTtcblxuICBcdFx0XHR5VGljay5lbnRlcigpXG4gIFx0XHRcdCAgLmFwcGVuZCgnZycpXG4gIFx0XHRcdCAgLmF0dHIoJ3RyYW5zZm9ybScsIGZ1bmN0aW9uKGQpIHtcbiAgXHRcdFx0XHRyZXR1cm4gJ3RyYW5zbGF0ZSgwLCAnICsgeVNjYWxlKGQpICsgJyknO1xuICBcdFx0XHQgIH0pXG4gIFx0XHRcdCAgLmFwcGVuZCgnbGluZScpXG4gIFx0XHRcdCAgLmNsYXNzZWQoJ3ktdGljaycsIHRydWUpXG4gIFx0XHRcdCAgLmF0dHIoJ3gxJywgY29uZmlnLm1hcmdpbi5sZWZ0KVxuICBcdFx0XHQgIC5hdHRyKCd4MicsIGNvbmZpZy5tYXJnaW4ubGVmdCArIGdyYXBoV2lkdGgpO1xuXG5cdFx0XHQgIHlUaWNrLmV4aXQoKS5yZW1vdmUoKTtcblxuICBcdFx0XHR2YXIgY3VyeCwgY3VyeTtcbiAgXHRcdFx0dmFyIHpvb21SZWN0ID0gc3ZnXG4gIFx0XHRcdCAgLmFwcGVuZCgncmVjdCcpXG4gIFx0XHRcdCAgLmNhbGwoem9vbSlcbiAgXHRcdFx0ICAuY2xhc3NlZCgnem9vbScsIHRydWUpXG4gIFx0XHRcdCAgLmF0dHIoJ3dpZHRoJywgZ3JhcGhXaWR0aClcbiAgXHRcdFx0ICAuYXR0cignaGVpZ2h0JywgaGVpZ2h0IClcbiAgXHRcdFx0ICAuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgnICsgY29uZmlnLm1hcmdpbi5sZWZ0ICsgJywgMzUpJylcbiAgXHRcdFx0O1xuXG4gIFx0XHRcdGlmICh0eXBlb2YgY29uZmlnLmV2ZW50SG92ZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgXHRcdFx0ICB6b29tUmVjdC5vbignbW91c2Vtb3ZlJywgZnVuY3Rpb24oZCwgZSkge1xuICBcdFx0XHRcdHZhciBldmVudCA9IGQzLmV2ZW50O1xuICBcdFx0XHRcdGlmIChjdXJ4ID09IGV2ZW50LmNsaWVudFggJiYgY3VyeSA9PSBldmVudC5jbGllbnRZKSByZXR1cm47XG4gIFx0XHRcdFx0Y3VyeCA9IGV2ZW50LmNsaWVudFg7XG4gIFx0XHRcdFx0Y3VyeSA9IGV2ZW50LmNsaWVudFk7XG4gIFx0XHRcdFx0em9vbVJlY3QuYXR0cignZGlzcGxheScsICdub25lJyk7XG4gIFx0XHRcdFx0dmFyIGVsID0gZG9jdW1lbnQuZWxlbWVudEZyb21Qb2ludChkMy5ldmVudC5jbGllbnRYLCBkMy5ldmVudC5jbGllbnRZKTtcbiAgXHRcdFx0XHR6b29tUmVjdC5hdHRyKCdkaXNwbGF5JywgJ2Jsb2NrJyk7XG4gIFx0XHRcdFx0aWYgKGVsLnRhZ05hbWUgIT09ICdjaXJjbGUnKSByZXR1cm47XG4gIFx0XHRcdFx0Y29uZmlnLmV2ZW50SG92ZXIoZWwpO1xuICBcdFx0XHQgIH0pO1xuICBcdFx0XHR9XG5cbiAgXHRcdFx0aWYgKHR5cGVvZiBjb25maWcuZXZlbnRDbGljayA9PT0gJ2Z1bmN0aW9uJykge1xuICBcdFx0XHQgIHpvb21SZWN0Lm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgXHRcdFx0XHR6b29tUmVjdC5hdHRyKCdkaXNwbGF5JywgJ25vbmUnKTtcbiAgXHRcdFx0XHR2YXIgZWwgPSBkb2N1bWVudC5lbGVtZW50RnJvbVBvaW50KGQzLmV2ZW50LmNsaWVudFgsIGQzLmV2ZW50LmNsaWVudFkpO1xuICBcdFx0XHRcdHpvb21SZWN0LmF0dHIoJ2Rpc3BsYXknLCAnYmxvY2snKTtcbiAgXHRcdFx0XHRpZiAoZWwudGFnTmFtZSAhPT0gJ2NpcmNsZScpIHJldHVybjtcbiAgXHRcdFx0XHRjb25maWcuZXZlbnRDbGljayhlbCk7XG4gIFx0XHRcdCAgfSk7XG4gIFx0XHRcdH1cblxuICAgICAgICB4U2NhbGUucmFuZ2UoWzAsIGdyYXBoV2lkdGhdKS5kb21haW4oW2NvbmZpZy5zdGFydCwgY29uZmlnLmVuZF0pO1xuXG4gICAgICAgIHpvb20ueCh4U2NhbGUpO1xuXG4gICAgICAgIGZ1bmN0aW9uIHVwZGF0ZVpvb20oKSB7XG4gICAgICAgICAgaWYgKGQzLmV2ZW50LnNvdXJjZUV2ZW50ICYmIGQzLmV2ZW50LnNvdXJjZUV2ZW50LnRvU3RyaW5nKCkgPT09ICdbb2JqZWN0IE1vdXNlRXZlbnRdJykge1xuICAgICAgICAgICAgem9vbS50cmFuc2xhdGUoW2QzLmV2ZW50LnRyYW5zbGF0ZVswXSwgMF0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChkMy5ldmVudC5zb3VyY2VFdmVudCAmJiBkMy5ldmVudC5zb3VyY2VFdmVudC50b1N0cmluZygpID09PSAnW29iamVjdCBXaGVlbEV2ZW50XScpIHtcbiAgICAgICAgICAgIHpvb20uc2NhbGUoZDMuZXZlbnQuc2NhbGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZWRyYXcoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGluaXRpYWxpemF0aW9uIG9mIHRoZSBkZWxpbWl0ZXJcbiAgICAgICAgc3ZnLnNlbGVjdCgnLmRlbGltaXRlcicpLnJlbW92ZSgpO1xuICAgICAgICB2YXIgZGVsaW1pdGVyRWwgPSBzdmdcbiAgICAgICAgICAuYXBwZW5kKCdnJylcbiAgICAgICAgICAuY2xhc3NlZCgnZGVsaW1pdGVyJywgdHJ1ZSlcbiAgICAgICAgICAuYXR0cignd2lkdGgnLCBncmFwaFdpZHRoKVxuICAgICAgICAgIC5hdHRyKCdoZWlnaHQnLCAxMClcbiAgICAgICAgICAuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgnICsgY29uZmlnLm1hcmdpbi5sZWZ0ICsgJywgJyArIChjb25maWcubWFyZ2luLnRvcCAtIDQ1KSArICcpJylcbiAgICAgICAgICAuY2FsbChkZWxpbWl0ZXIoe1xuICAgICAgICAgICAgeFNjYWxlOiB4U2NhbGUsXG4gICAgICAgICAgICBkYXRlRm9ybWF0OiBjb25maWcubG9jYWxlID8gY29uZmlnLmxvY2FsZS50aW1lRm9ybWF0KFwiJWQgJUIgJVlcIikgOiBkMy50aW1lLmZvcm1hdChcIiVkICVCICVZXCIpXG4gICAgICAgICAgfSkpXG4gICAgICAgIDtcblxuICAgICAgICBmdW5jdGlvbiByZWRyYXdEZWxpbWl0ZXIoKSB7XG4gICAgICAgICAgZGVsaW1pdGVyRWwuY2FsbChkZWxpbWl0ZXIoe1xuICAgICAgICAgICAgeFNjYWxlOiB4U2NhbGUsXG4gICAgICAgICAgICBkYXRlRm9ybWF0OiBjb25maWcubG9jYWxlID8gY29uZmlnLmxvY2FsZS50aW1lRm9ybWF0KFwiJWQgJUIgJVlcIikgOiBkMy50aW1lLmZvcm1hdChcIiVkICVCICVZXCIpXG4gICAgICAgICAgfSkpO1xuICAgICAgICB9XG5cbiAgXHRcdFx0ZnVuY3Rpb24gem9vbUVuZCgpIHtcbiAgXHRcdFx0ICBpZiAoY29uZmlnLmV2ZW50Wm9vbSkge1xuICBcdFx0XHRcdCAgY29uZmlnLmV2ZW50Wm9vbSh4U2NhbGUpO1xuICBcdFx0XHQgIH1cbiAgXHRcdFx0ICBpZiAoY29uZmlnLmhhc0RlbGltaXRlcikge1xuICBcdFx0XHRcdCAgcmVkcmF3RGVsaW1pdGVyKCk7XG4gIFx0XHRcdCAgfVxuICBcdFx0XHR9XG5cbiAgICAgICAgdmFyIGhhc1RvcEF4aXMgPSB0eXBlb2YgY29uZmlnLmhhc1RvcEF4aXMgPT09ICdmdW5jdGlvbicgPyBjb25maWcuaGFzVG9wQXhpcyhkYXRhKSA6IGNvbmZpZy5oYXNUb3BBeGlzO1xuICAgICAgICBpZiAoaGFzVG9wQXhpcykge1xuICAgICAgICAgIHhBeGlzVG9wID0geEF4aXNGYWN0b3J5KGQzLCBjb25maWcsIHhTY2FsZSwgZ3JhcGgsIGdyYXBoSGVpZ2h0LCAndG9wJyk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgaGFzQm90dG9tQXhpcyA9IHR5cGVvZiBjb25maWcuaGFzQm90dG9tQXhpcyA9PT0gJ2Z1bmN0aW9uJyA/IGNvbmZpZy5oYXNCb3R0b21BeGlzKGRhdGEpIDogY29uZmlnLmhhc0JvdHRvbUF4aXM7XG4gICAgICAgIGlmIChoYXNCb3R0b21BeGlzKSB7XG4gICAgICAgICAgeEF4aXNCb3R0b20gPSB4QXhpc0ZhY3RvcnkoZDMsIGNvbmZpZywgeFNjYWxlLCBncmFwaCwgZ3JhcGhIZWlnaHQsICdib3R0b20nKTtcbiAgICAgICAgfVxuXG4gIFx0XHRcdGZ1bmN0aW9uIGRyYXdYQXhpcyh3aGVyZSkge1xuICBcdFx0XHQgIC8vIGNvcHkgY29uZmlnLnRpY2tGb3JtYXQgYmVjYXVzZSBkMyBmb3JtYXQubXVsdGkgZWRpdCBpdHMgZ2l2ZW4gdGlja0Zvcm1hdCBkYXRhXG4gIFx0XHRcdCAgdmFyIHRpY2tGb3JtYXREYXRhID0gW107XG5cbiAgXHRcdFx0ICBjb25maWcudGlja0Zvcm1hdC5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtKSB7XG4gIFx0XHRcdFx0ICB2YXIgdGljayA9IGl0ZW0uc2xpY2UoMCk7XG4gIFx0XHRcdFx0ICB0aWNrRm9ybWF0RGF0YS5wdXNoKHRpY2spO1xuICBcdFx0XHQgIH0pO1xuXG4gIFx0XHRcdCAgdmFyIHRpY2tGb3JtYXQgPSBjb25maWcubG9jYWxlID8gY29uZmlnLmxvY2FsZS50aW1lRm9ybWF0Lm11bHRpKHRpY2tGb3JtYXREYXRhKSA6IGQzLnRpbWUuZm9ybWF0Lm11bHRpKHRpY2tGb3JtYXREYXRhKTtcbiAgXHRcdFx0ICB2YXIgeEF4aXMgPSBkMy5zdmcuYXhpcygpXG4gIFx0XHRcdFx0ICAuc2NhbGUoeFNjYWxlKVxuICBcdFx0XHRcdCAgLm9yaWVudCh3aGVyZSlcbiAgXHRcdFx0XHQgIC50aWNrRm9ybWF0KHRpY2tGb3JtYXQpXG4gIFx0XHRcdCAgO1xuXG4gIFx0XHRcdCAgaWYgKHR5cGVvZiBjb25maWcuYXhpc0Zvcm1hdCA9PT0gJ2Z1bmN0aW9uJykge1xuICBcdFx0XHRcdCAgY29uZmlnLmF4aXNGb3JtYXQoeEF4aXMpO1xuICBcdFx0XHQgIH1cblxuICBcdFx0XHQgIHZhciB5ID0gKHdoZXJlID09ICdib3R0b20nID8gcGFyc2VJbnQoZ3JhcGhIZWlnaHQpIDogMCkgKyBjb25maWcubWFyZ2luLnRvcCAtIDQwO1xuXG4gIFx0XHRcdCAgZ3JhcGguc2VsZWN0KCcueC1heGlzLicgKyB3aGVyZSkucmVtb3ZlKCk7XG4gIFx0XHRcdCAgdmFyIHhBeGlzRWwgPSBncmFwaFxuICAgIFx0XHRcdFx0LmFwcGVuZCgnZycpXG4gICAgXHRcdFx0XHQuY2xhc3NlZCgneC1heGlzJywgdHJ1ZSlcbiAgICBcdFx0XHRcdC5jbGFzc2VkKHdoZXJlLCB0cnVlKVxuICAgIFx0XHRcdFx0LmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoJyArIGNvbmZpZy5tYXJnaW4ubGVmdCArICcsICcgKyB5ICsgJyknKVxuICAgIFx0XHRcdFx0LmNhbGwoeEF4aXMpXG4gIFx0XHRcdCAgO1xuICBcdFx0XHR9XG5cbiAgXHRcdFx0Ly8gaW5pdGlhbGl6YXRpb24gb2YgdGhlIGdyYXBoIGJvZHlcbiAgICAgICAgem9vbS5zaXplKFtjb25maWcud2lkdGgsIGhlaWdodF0pO1xuXG4gICAgICAgIGdyYXBoLnNlbGVjdCgnLmdyYXBoLWJvZHknKS5yZW1vdmUoKTtcbiAgICAgICAgdmFyIGdyYXBoQm9keSA9IGdyYXBoXG4gICAgICAgICAgLmFwcGVuZCgnZycpXG4gICAgICAgICAgLmNsYXNzZWQoJ2dyYXBoLWJvZHknLCB0cnVlKVxuICAgICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCcgKyBjb25maWcubWFyZ2luLmxlZnQgKyAnLCAnICsgKGNvbmZpZy5tYXJnaW4udG9wIC0gMTUpICsgJyknKTtcblxuICAgICAgICB2YXIgbGluZXMgPSBncmFwaEJvZHkuc2VsZWN0QWxsKCdnJykuZGF0YShkYXRhKTtcblxuICAgICAgICBsaW5lcy5lbnRlcigpXG4gICAgICAgICAgLmFwcGVuZCgnZycpXG4gICAgICAgICAgLmNsYXNzZWQoJ2xpbmUnLCB0cnVlKVxuICAgICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCBmdW5jdGlvbihkKSB7XG4gICAgICAgICAgICByZXR1cm4gJ3RyYW5zbGF0ZSgwLCcgKyB5U2NhbGUoZC5uYW1lKSArICcpJztcbiAgICAgICAgICB9KVxuICAgICAgICAgIC5zdHlsZSgnZmlsbCcsIGNvbmZpZy5ldmVudExpbmVDb2xvcilcbiAgICAgICAgICAuY2FsbChldmVudExpbmUoeyB4U2NhbGU6IHhTY2FsZSwgZXZlbnRDb2xvcjogY29uZmlnLmV2ZW50Q29sb3IgfSkpXG4gICAgICAgIDtcblxuICAgICAgICBsaW5lcy5leGl0KCkucmVtb3ZlKCk7XG5cbiAgICAgICAgZnVuY3Rpb24gcmVkcmF3KCkge1xuICAgICAgICAgIC8vIFN0b3JlIHRoZSBjdXJyZW50IHRyYW5zZm9ybWF0aW9uIG1hdHJpeFxuICAgICAgICAgIGN0eC5zYXZlKCk7XG4gICAgICAgICAgLy8gU2V0IGJhY2sgdG8gdGhlIG9yaWdpbmFsIGNhbnZhc1xuICAgICAgICAgIGN0eC5zZXRUcmFuc2Zvcm0oMSwgMCwgMCwgMSwgMCwgMCk7XG4gICAgICAgICAgLy8gQ2xlYXIgdGhlIGNhbnZhc1xuICAgICAgICAgIGN0eC5jbGVhclJlY3QoMCwgMCwgZ3JhcGhXaWR0aCwgZ3JhcGhIZWlnaHQpO1xuICAgICAgICAgIC8vIFJlc3RvcmUgdGhlIGZvcm1lciBjb29yZGluYXRlc1xuICAgICAgICAgIGN0eC5yZXN0b3JlKCk7XG5cbiAgICAgICAgICB2YXIgaGFzVG9wQXhpcyA9IHR5cGVvZiBjb25maWcuaGFzVG9wQXhpcyA9PT0gJ2Z1bmN0aW9uJyA/IGNvbmZpZy5oYXNUb3BBeGlzKGRhdGEpIDogY29uZmlnLmhhc1RvcEF4aXM7XG4gICAgICAgICAgaWYgKGhhc1RvcEF4aXMpIHtcbiAgICAgICAgICAgIHhBeGlzVG9wLmRyYXdYQXhpcygpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHZhciBoYXNCb3R0b21BeGlzID0gdHlwZW9mIGNvbmZpZy5oYXNCb3R0b21BeGlzID09PSAnZnVuY3Rpb24nID8gY29uZmlnLmhhc0JvdHRvbUF4aXMoZGF0YSkgOiBjb25maWcuaGFzQm90dG9tQXhpcztcbiAgICAgICAgICBpZiAoaGFzQm90dG9tQXhpcykge1xuICAgICAgICAgICAgeEF4aXNCb3R0b20uZHJhd1hBeGlzKCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbGluZXMuY2FsbChldmVudExpbmUoeyB4U2NhbGU6IHhTY2FsZSwgeVNjYWxlOiB5U2NhbGUsIGV2ZW50TGluZUNvbG9yOiBjb25maWcuZXZlbnRMaW5lQ29sb3IsIGV2ZW50Q29sb3I6IGNvbmZpZy5ldmVudENvbG9yIH0pKTtcblxuICAgICAgICAgIC8vIEFwcGx5aW5nIHRoZSBsaW5pbmcgZmlsdGVyIHRvIHRoZSBjYW52YXNcbiAgICAgICAgICBGaWx0ZXJGYWN0b3J5LmZpbHRlcigpO1xuICBcdFx0XHR9XG5cbiAgXHRcdFx0cmVkcmF3KCk7XG4gIFx0XHRcdGlmIChjb25maWcuaGFzRGVsaW1pdGVyKSB7XG4gIFx0XHRcdCAgcmVkcmF3RGVsaW1pdGVyKCk7XG4gIFx0XHRcdH1cbiAgXHRcdFx0aWYgKGNvbmZpZy5ldmVudFpvb20pIHtcbiAgXHRcdFx0ICBjb25maWcuZXZlbnRab29tKHhTY2FsZSk7XG4gIFx0XHRcdH1cblx0XHQgIH0pO1xuXHRcdH1cblx0XHRjb25maWd1cmFibGUoZXZlbnREcm9wR3JhcGgsIGNvbmZpZyk7XG5cblx0XHRyZXR1cm4gZXZlbnREcm9wR3JhcGg7XG4gIH07XG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vKiBnbG9iYWwgcmVxdWlyZSwgbW9kdWxlLCBkMyAqL1xuXG52YXIgY29uZmlndXJhYmxlID0gcmVxdWlyZSgnLi91dGlsL2NvbmZpZ3VyYWJsZScpO1xudmFyIGZpbHRlckRhdGEgPSByZXF1aXJlKCcuL2ZpbHRlckRhdGEnKTtcblxudmFyIGRlZmF1bHRDb25maWcgPSB7XG4gIHhTY2FsZTogbnVsbCxcbiAgeVNjYWxlOiBudWxsXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChkMywgY29udGV4dCkge1xuICByZXR1cm4gZnVuY3Rpb24gKGNvbmZpZykge1xuXG4gICAgY29uZmlnID0gY29uZmlnIHx8IHtcbiAgICAgIHhTY2FsZTogbnVsbCxcbiAgICAgIHlTY2FsZTogbnVsbCxcbiAgICAgIGV2ZW50TGluZUNvbG9yOiAnYmxhY2snLFxuICAgICAgd2lkdGg6IDAsXG4gICAgICBoZWlnaHQ6IDBcbiAgICB9O1xuICAgIGZvciAodmFyIGtleSBpbiBkZWZhdWx0Q29uZmlnKSB7XG4gICAgICBjb25maWdba2V5XSA9IGNvbmZpZ1trZXldIHx8IGRlZmF1bHRDb25maWdba2V5XTtcbiAgICB9XG5cbiAgICB2YXIgZXZlbnRMaW5lID0gZnVuY3Rpb24gZXZlbnRMaW5lKHNlbGVjdGlvbikge1xuICAgICAgc2VsZWN0aW9uLmVhY2goZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgZDMuc2VsZWN0KHRoaXMpLnNlbGVjdEFsbCgndGV4dCcpLnJlbW92ZSgpO1xuXG4gICAgICAgIGQzLnNlbGVjdCh0aGlzKS5hcHBlbmQoJ3RleHQnKVxuICAgICAgICAgIC50ZXh0KGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICAgIHZhciBjb3VudCA9IGZpbHRlckRhdGEoZC5kYXRlcywgY29uZmlnLnhTY2FsZSkubGVuZ3RoO1xuICAgICAgICAgICAgcmV0dXJuIGQubmFtZSArIChjb3VudCA+IDAgPyAnICgnICsgY291bnQgKyAnKScgOiAnJyk7XG4gICAgICAgICAgfSlcbiAgICAgICAgICAuYXR0cigndGV4dC1hbmNob3InLCAnZW5kJylcbiAgICAgICAgICAuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgtMjApJylcbiAgICAgICAgICAuc3R5bGUoJ2ZpbGwnLCAnYmxhY2snKVxuICAgICAgICA7XG5cbiAgICAgICAgdmFyIGRhdGFDb250YWluZXIgPSBkMy5zZWxlY3QoXCJib2R5XCIpLmFwcGVuZCgnY3VzdG9tJyk7XG5cbiAgICAgICAgdmFyIE1ldGFiYWxsRmFjdG9yeSA9IHJlcXVpcmUoJy4vbWV0YWJhbGl6aW5nVG9vbHMnKShjb250ZXh0LCBjb25maWcsIGZpbHRlckRhdGEpO1xuXG4gICAgICAgIE1ldGFiYWxsRmFjdG9yeS5kcmF3Q3VzdG9tKGRhdGEpO1xuICAgICAgfSk7XG4gICAgfTtcblxuICAgIGNvbmZpZ3VyYWJsZShldmVudExpbmUsIGNvbmZpZyk7XG5cbiAgICByZXR1cm4gZXZlbnRMaW5lO1xuICB9O1xufTtcbiIsIlwidXNlIHN0cmljdFwiO1xuLyogZ2xvYmFsIG1vZHVsZSAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGZpbHRlckRhdGUoZGF0YSwgc2NhbGUpIHtcbiAgZGF0YSA9IGRhdGEgfHwgW107XG4gIHZhciBib3VuZGFyeSA9IHNjYWxlLnJhbmdlKCk7XG4gIHZhciBtaW4gPSBib3VuZGFyeVswXTtcbiAgdmFyIG1heCA9IGJvdW5kYXJ5WzFdO1xuXG4gIHJldHVybiBkYXRhLmZpbHRlcihmdW5jdGlvbiAoZGF0dW0pIHtcbiAgICB2YXIgdmFsdWUgPSBzY2FsZShkYXR1bSk7XG4gICAgcmV0dXJuICEodmFsdWUgPCBtaW4gfHwgdmFsdWUgPiBtYXgpO1xuICB9KTtcbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcbi8qIGdsb2JhbCByZXF1aXJlLCBtb2R1bGUgKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY3R4KSB7XG5cbiAgdmFyIEZpbHRlcnMgPSB7fTtcbiAgRmlsdGVycy5nZXRQaXhlbHMgPSBmdW5jdGlvbihjdHgpIHtcbiAgICByZXR1cm4gY3R4LmdldEltYWdlRGF0YSgwLDAsODAwLDYwMCk7XG4gIH07XG5cbiAgRmlsdGVycy5maWx0ZXJJbWFnZSA9IGZ1bmN0aW9uKGZpbHRlciwgY3R4LCB2YXJfYXJncykge1xuICAgIHZhciBhcmdzID0gW3RoaXMuZ2V0UGl4ZWxzKGN0eCldO1xuICAgIGZvciAodmFyIGk9MjsgaTxhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGFyZ3MucHVzaChhcmd1bWVudHNbaV0pO1xuICAgIH1cbiAgICByZXR1cm4gZmlsdGVyLmFwcGx5KG51bGwsIGFyZ3MpO1xuICB9O1xuXG4gIEZpbHRlcnMuY3JlYXRlSW1hZ2VEYXRhID0gZnVuY3Rpb24odyxoKSB7XG4gICAgcmV0dXJuIGN0eC5jcmVhdGVJbWFnZURhdGEodyxoKTtcbiAgfTtcblxuICBGaWx0ZXJzLmNvbnZvbHV0ZSA9IGZ1bmN0aW9uKHBpeGVscywgd2VpZ2h0cywgb3BhcXVlKSB7XG4gICAgdmFyIHNpZGUgPSBNYXRoLnJvdW5kKE1hdGguc3FydCh3ZWlnaHRzLmxlbmd0aCkpO1xuICAgIHZhciBoYWxmU2lkZSA9IE1hdGguZmxvb3Ioc2lkZS8yKTtcbiAgICB2YXIgc3JjID0gcGl4ZWxzLmRhdGE7XG4gICAgdmFyIHN3ID0gcGl4ZWxzLndpZHRoO1xuICAgIHZhciBzaCA9IHBpeGVscy5oZWlnaHQ7XG4gICAgLy8gcGFkIG91dHB1dCBieSB0aGUgY29udm9sdXRpb24gbWF0cml4XG4gICAgdmFyIHcgPSBzdztcbiAgICB2YXIgaCA9IHNoO1xuICAgIHZhciBvdXRwdXQgPSBGaWx0ZXJzLmNyZWF0ZUltYWdlRGF0YSg4MDAsIDYwMCk7XG4gICAgdmFyIGRzdCA9IG91dHB1dC5kYXRhO1xuICAgIC8vIGdvIHRocm91Z2ggdGhlIGRlc3RpbmF0aW9uIGltYWdlIHBpeGVsc1xuICAgIGZvciAodmFyIHk9MDsgeTxoOyB5KyspIHtcbiAgICAgIGZvciAodmFyIHg9MDsgeDx3OyB4KyspIHtcbiAgICAgICAgdmFyIHN5ID0geTtcbiAgICAgICAgdmFyIHN4ID0geDtcbiAgICAgICAgdmFyIGRzdE9mZiA9ICh5KncreCkqNDtcbiAgICAgICAgLy8gY2FsY3VsYXRlIHRoZSB3ZWlnaGVkIHN1bSBvZiB0aGUgc291cmNlIGltYWdlIHBpeGVscyB0aGF0XG4gICAgICAgIC8vIGZhbGwgdW5kZXIgdGhlIGNvbnZvbHV0aW9uIG1hdHJpeFxuICAgICAgICB2YXIgcj0wLCBnPTAsIGI9MCwgYT0wO1xuICAgICAgICBmb3IgKHZhciBjeT0wOyBjeTxzaWRlOyBjeSsrKSB7XG4gICAgICAgICAgZm9yICh2YXIgY3g9MDsgY3g8c2lkZTsgY3grKykge1xuICAgICAgICAgICAgdmFyIHNjeSA9IHN5ICsgY3kgLSBoYWxmU2lkZTtcbiAgICAgICAgICAgIHZhciBzY3ggPSBzeCArIGN4IC0gaGFsZlNpZGU7XG4gICAgICAgICAgICBpZiAoc2N5ID49IDAgJiYgc2N5IDwgc2ggJiYgc2N4ID49IDAgJiYgc2N4IDwgc3cpIHtcbiAgICAgICAgICAgICAgdmFyIHNyY09mZiA9IChzY3kqc3crc2N4KSo0O1xuICAgICAgICAgICAgICB2YXIgd3QgPSB3ZWlnaHRzW2N5KnNpZGUrY3hdO1xuICAgICAgICAgICAgICByICs9IHNyY1tzcmNPZmZdICogd3Q7XG4gICAgICAgICAgICAgIGcgKz0gc3JjW3NyY09mZisxXSAqIHd0O1xuICAgICAgICAgICAgICBiICs9IHNyY1tzcmNPZmYrMl0gKiB3dDtcbiAgICAgICAgICAgICAgYSArPSBzcmNbc3JjT2ZmKzNdICogd3Q7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGRzdFtkc3RPZmZdID0gcjtcbiAgICAgICAgZHN0W2RzdE9mZisxXSA9IGc7XG4gICAgICAgIGRzdFtkc3RPZmYrMl0gPSBiO1xuICAgICAgICBkc3RbZHN0T2ZmKzNdID0gYTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG91dHB1dDtcbiAgfTtcblxuICB2YXIgZmlsdGVyID0gZnVuY3Rpb24gZmlsdGVyKCkge1xuICAgIHZhciByZXN1bHQgPSBGaWx0ZXJzLmZpbHRlckltYWdlKEZpbHRlcnMuY29udm9sdXRlLCBjdHgsXG4gICAgWyAxLzksIDEvOSwgMS85LFxuICAgICAgMS85LCAxLzksIDEvOSxcbiAgICAgIDEvOSwgMS85LCAxLzkgXVxuICAgICk7XG5cbiAgICBjdHgucHV0SW1hZ2VEYXRhKHJlc3VsdCwgMCwgMCk7XG4gIH07XG5cbiAgcmV0dXJuIHtcbiAgICBmaWx0ZXI6IGZpbHRlclxuICB9O1xufTtcbiIsIlwidXNlIHN0cmljdFwiO1xuLyogZ2xvYmFsIHJlcXVpcmUsIGRlZmluZSwgbW9kdWxlICovXG5cbnZhciBldmVudERyb3BzID0gcmVxdWlyZSgnLi9ldmVudERyb3BzJyk7XG5cbmlmICh0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCkge1xuICBkZWZpbmUoJ2QzLmNoYXJ0LmV2ZW50RHJvcHMnLCBbXCJkM1wiXSwgZnVuY3Rpb24gKGQzKSB7XG4gICAgZDMuY2hhcnQgPSBkMy5jaGFydCB8fCB7fTtcbiAgICBkMy5jaGFydC5ldmVudERyb3BzID0gZXZlbnREcm9wcyhkMywgZG9jdW1lbnQpO1xuICB9KTtcbn0gZWxzZSBpZiAod2luZG93KSB7XG4gIHdpbmRvdy5kMy5jaGFydCA9IHdpbmRvdy5kMy5jaGFydCB8fCB7fTtcbiAgd2luZG93LmQzLmNoYXJ0LmV2ZW50RHJvcHMgPSBldmVudERyb3BzKHdpbmRvdy5kMywgZG9jdW1lbnQpO1xufSBlbHNlIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBldmVudERyb3BzO1xufVxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vKiBnbG9iYWwgcmVxdWlyZSwgbW9kdWxlICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNvbnRleHQsIGNvbmZpZywgZmlsdGVyRGF0YSkge1xuXG4gIGZ1bmN0aW9uIGhleFRvUmdiKGhleCwgYWxwaGEpIHtcbiAgICB2YXIgcmVzdWx0ID0gL14jPyhbYS1mXFxkXXsyfSkoW2EtZlxcZF17Mn0pKFthLWZcXGRdezJ9KSQvaS5leGVjKGhleCk7XG4gICAgdmFyIHRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKCF0aGlzLmFscGhhKSB7XG4gICAgICAgIHJldHVybiBcInJnYihcIiArIHRoaXMuciArIFwiLCBcIiArIHRoaXMuZyArIFwiLCBcIiArIHRoaXMuYiArIFwiKVwiO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMuYWxwaGEgPiAxKSB7XG4gICAgICAgIHRoaXMuYWxwaGEgPSAxO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLmFscGhhIDwgMCkge1xuICAgICAgICB0aGlzLmFscGhhID0gMDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBcInJnYmEoXCIgKyB0aGlzLnIgKyBcIiwgXCIgKyB0aGlzLmcgKyBcIiwgXCIgKyB0aGlzLmIgKyBcIiwgXCIgKyB0aGlzLmFscGhhICsgXCIpXCI7XG4gICAgfTtcbiAgICBpZiAoIWFscGhhKSB7XG4gICAgICByZXR1cm4gcmVzdWx0ID8ge1xuICAgICAgICByOiBwYXJzZUludChyZXN1bHRbMV0sIDE2KSxcbiAgICAgICAgZzogcGFyc2VJbnQocmVzdWx0WzJdLCAxNiksXG4gICAgICAgIGI6IHBhcnNlSW50KHJlc3VsdFszXSwgMTYpLFxuICAgICAgICB0b1N0cmluZzogdG9TdHJpbmdcbiAgICAgIH0gOiBudWxsO1xuICAgIH1cbiAgICBpZiAoYWxwaGEgPiAxKSB7XG4gICAgICBhbHBoYSA9IDE7XG4gICAgfSBlbHNlIGlmIChhbHBoYSA8IDApIHtcbiAgICAgIGFscGhhID0gMDtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdCA/IHtcbiAgICAgIHI6IHBhcnNlSW50KHJlc3VsdFsxXSwgMTYpLFxuICAgICAgZzogcGFyc2VJbnQocmVzdWx0WzJdLCAxNiksXG4gICAgICBiOiBwYXJzZUludChyZXN1bHRbM10sIDE2KSxcbiAgICAgIGFscGhhOiBhbHBoYSxcbiAgICAgIHRvU3RyaW5nOiB0b1N0cmluZ1xuICAgIH0gOiBudWxsO1xuICB9XG5cbiAgdmFyIGRyYXdDdXN0b20gPSBmdW5jdGlvbiBkcmF3Q3VzdG9tIChkYXRhKSB7XG4gICAgdmFyIGRhdGVzID0gZmlsdGVyRGF0YShkYXRhLmRhdGVzLCBjb25maWcueFNjYWxlKTtcbiAgICB2YXIgeSA9IDA7XG4gICAgaWYgKHR5cGVvZiBjb25maWcueVNjYWxlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICB5ID0gY29uZmlnLnlTY2FsZShkYXRhLm5hbWUpICsgMjU7XG4gICAgfWVsc2V7XG4gICAgICB5ID0gY29uZmlnLnlTY2FsZSArIDI1O1xuICAgIH1cbiAgICB2YXIgY29sb3IgPSAnYmxhY2snO1xuICAgIGlmIChjb25maWcuZXZlbnRMaW5lQ29sb3IpIHtcbiAgICAgIGlmICh0eXBlb2YgY29uZmlnLmV2ZW50TGluZUNvbG9yID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGNvbG9yID0gY29uZmlnLmV2ZW50TGluZUNvbG9yKGRhdGEsIGRhdGEubmFtZSk7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgY29sb3IgPSBjb25maWcuZXZlbnRMaW5lQ29sb3I7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIGRhdGVUYWIgPSBkYXRlcy5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgIHJldHVybiBhIC0gYjtcbiAgICB9KTtcblxuICAgIHZhciBwb2ludHMgPSBbXTtcbiAgICB2YXIgaW5kZXggPSAwO1xuXG4gICAgdmFyIGNvbG9ycyA9IGhleFRvUmdiKGNvbG9yLCAxKTtcblxuICAgIGlmIChjb250ZXh0KSB7XG4gICAgICBkcmF3TGluZShkYXRlVGFiLCB5LCBjb2xvcnMsIGNvbnRleHQsIHBvaW50cyk7XG4gICAgfVxuICB9O1xuXG4gIGZ1bmN0aW9uIGRyYXdMaW5lKGRhdGVzLCBjb29yWSwgY29sb3JzLCBjb250ZXh0LCBwb2ludHMpIHtcbiAgICBkYXRlcy5mb3JFYWNoKGZ1bmN0aW9uKGRhdGUpIHtcbiAgICAgIHZhciB4ID0gY29uZmlnLnhTY2FsZShkYXRlKSxcbiAgICAgICAgICB5ID0gY29vclksXG4gICAgICAgICAgc2l6ZSA9IDE1O1xuXG4gICAgICBwb2ludHMucHVzaCh7eDp4LHk6eSxzaXplOnNpemV9KTtcbiAgICB9KTtcblxuICAgIGZ1bmN0aW9uIHVwZGF0ZSgpIHtcbiAgICAgIHZhciBsZW4gPSBwb2ludHMubGVuZ3RoO1xuICAgICAgd2hpbGUgKGxlbi0tKSB7XG4gICAgICAgIHZhciBwb2ludCA9IHBvaW50c1tsZW5dO1xuXG4gICAgICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XG4gICAgICAgIHZhciBncmFkID0gY29udGV4dC5jcmVhdGVSYWRpYWxHcmFkaWVudChwb2ludC54LCBwb2ludC55LCAxLCBwb2ludC54LCBwb2ludC55LCBwb2ludC5zaXplKTtcbiAgICAgICAgaWYgKGNvbG9ycykge1xuICAgICAgICAgIGdyYWQuYWRkQ29sb3JTdG9wKDAsICdyZ2JhKCcgKyBjb2xvcnMuciArJywnICsgY29sb3JzLmcgKyAnLCcgKyBjb2xvcnMuYiArICcsMSknKTtcbiAgICAgICAgICBncmFkLmFkZENvbG9yU3RvcCgxLCAncmdiYSgnICsgY29sb3JzLnIgKycsJyArIGNvbG9ycy5nICsgJywnICsgY29sb3JzLmIgKyAnLDApJyk7XG4gICAgICAgICAgY29udGV4dC5maWxsU3R5bGUgPSBncmFkO1xuICAgICAgICB9XG4gICAgICAgIGNvbnRleHQuYXJjKHBvaW50LngsIHBvaW50LnksIHBvaW50LnNpemUsIDAsIE1hdGguUEkqMik7XG4gICAgICAgIGNvbnRleHQuZmlsbCgpO1xuICAgICAgfVxuICAgICAgbWV0YWJhbGl6ZSgpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG1ldGFiYWxpemUoKSB7XG4gICAgICB2YXIgdGhyZXNob2xkID0gMTgwO1xuICAgICAgdmFyIGltYWdlRGF0YSA9IGNvbnRleHQuZ2V0SW1hZ2VEYXRhKDAsMCxjb25maWcud2lkdGgsY29uZmlnLmhlaWdodCksXG4gICAgICBwaXggPSBpbWFnZURhdGEuZGF0YTtcblxuICAgICAgdmFyIGFscGhhO1xuICAgICAgZm9yICh2YXIgaSA9IDAsIG4gPSBwaXgubGVuZ3RoOyBpIDwgbjsgaSArPSA0KSB7XG4gICAgICAgIGFscGhhID0gcGl4W2krM107XG4gICAgICAgIGlmKGFscGhhIDwgdGhyZXNob2xkKXtcbiAgICAgICAgICBhbHBoYSA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgcGl4W2kgKyAzXSA9IGFscGhhID09PSAwID8gMCA6IDI1NTtcbiAgICAgIH1cbiAgICAgIGNvbnRleHQucHV0SW1hZ2VEYXRhKGltYWdlRGF0YSwgMCwgMCk7XG4gICAgfVxuXG4gICAgdXBkYXRlKCk7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGRyYXdDdXN0b206IGRyYXdDdXN0b21cbiAgfTtcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNvbmZpZ3VyYWJsZSh0YXJnZXRGdW5jdGlvbiwgY29uZmlnLCBsaXN0ZW5lcnMpIHtcbiAgbGlzdGVuZXJzID0gbGlzdGVuZXJzIHx8IHt9O1xuICBmb3IgKHZhciBpdGVtIGluIGNvbmZpZykge1xuICAgIChmdW5jdGlvbihpdGVtKSB7XG4gICAgICB0YXJnZXRGdW5jdGlvbltpdGVtXSA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIGNvbmZpZ1tpdGVtXTtcbiAgICAgICAgY29uZmlnW2l0ZW1dID0gdmFsdWU7XG4gICAgICAgIGlmIChsaXN0ZW5lcnMuaGFzT3duUHJvcGVydHkoaXRlbSkpIHtcbiAgICAgICAgICBsaXN0ZW5lcnNbaXRlbV0odmFsdWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRhcmdldEZ1bmN0aW9uO1xuICAgICAgfTtcbiAgICB9KShpdGVtKTsgLy8gZm9yIGRvZXNuJ3QgY3JlYXRlIGEgY2xvc3VyZSwgZm9yY2luZyBpdFxuICB9XG59O1xuIiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGQzLCBjb25maWcsIHhTY2FsZSwgZ3JhcGgsIGdyYXBoSGVpZ2h0LCB3aGVyZSkge1xuICB2YXIgeEF4aXMgPSB7fTtcbiAgdmFyIHhBeGlzRWxzID0ge307XG5cbiAgdmFyIHRpY2tGb3JtYXREYXRhID0gW107XG5cbiAgY29uZmlnLnRpY2tGb3JtYXQuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSkge1xuICAgIHZhciB0aWNrID0gaXRlbS5zbGljZSgwKTtcbiAgICB0aWNrRm9ybWF0RGF0YS5wdXNoKHRpY2spO1xuICB9KTtcblxuICB2YXIgdGlja0Zvcm1hdCA9IGNvbmZpZy5sb2NhbGUgPyBjb25maWcubG9jYWxlLnRpbWVGb3JtYXQubXVsdGkodGlja0Zvcm1hdERhdGEpIDogZDMudGltZS5mb3JtYXQubXVsdGkodGlja0Zvcm1hdERhdGEpO1xuICB4QXhpc1t3aGVyZV0gPSBkMy5zdmcuYXhpcygpXG4gICAgLnNjYWxlKHhTY2FsZSlcbiAgICAub3JpZW50KHdoZXJlKVxuICAgIC50aWNrRm9ybWF0KHRpY2tGb3JtYXQpXG4gIDtcblxuICBpZiAodHlwZW9mIGNvbmZpZy5heGlzRm9ybWF0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgY29uZmlnLmF4aXNGb3JtYXQoeEF4aXMpO1xuICB9XG5cbiAgdmFyIHkgPSAod2hlcmUgPT0gJ2JvdHRvbScgPyBwYXJzZUludChncmFwaEhlaWdodCkgOiAwKSArIGNvbmZpZy5tYXJnaW4udG9wIC0gNDA7XG5cbiAgeEF4aXNFbHNbd2hlcmVdID0gZ3JhcGhcbiAgICAuYXBwZW5kKCdnJylcbiAgICAuY2xhc3NlZCgneC1heGlzJywgdHJ1ZSlcbiAgICAuY2xhc3NlZCh3aGVyZSwgdHJ1ZSlcbiAgICAuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgnICsgY29uZmlnLm1hcmdpbi5sZWZ0ICsgJywgJyArIHkgKyAnKScpXG4gICAgLmNhbGwoeEF4aXNbd2hlcmVdKVxuICA7XG5cbiAgdmFyIGRyYXdYQXhpcyA9IGZ1bmN0aW9uIGRyYXdYQXhpcygpIHtcbiAgICB4QXhpc0Vsc1t3aGVyZV1cbiAgICAgIC5jYWxsKHhBeGlzW3doZXJlXSlcbiAgICA7XG4gIH07XG5cbiAgcmV0dXJuIHtcbiAgICBkcmF3WEF4aXM6IGRyYXdYQXhpc1xuICB9O1xufTtcbiJdfQ==
