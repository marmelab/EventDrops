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

        var eventLine = require('./eventLine')(d3, ctx, graphWidth, graphHeight);
        var FilterFactory = require('./filterLining')(ctx, graphWidth, graphHeight);

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

          lines.call(eventLine({ xScale: xScale, yScale: yScale, eventLineColor: config.eventLineColor}));

          function metabalize() {
            var threshold = 180;
            var start = (new Date()).getTime();
            var imageData = ctx.getImageData(0,0,graphWidth,graphHeight);
            var pix = imageData.data;

            for (var i = 0, n = pix.length; i < n; i += 4) {
              pix[i + 3] = pix[i+3] < threshold ? 0 : 255;
            }
            ctx.putImageData(imageData, 0, 0);
            //console.log((new Date()).getTime()-start, 'ms for threshold');
          }

          metabalize();

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

module.exports = function (d3, context, width, height) {
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

        var MetaballFactory = require('./metabalizingTools')(context, config, filterData, width, height);

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

module.exports = function (ctx, width, height) {

  var Filters = {};
  Filters.getPixels = function(ctx) {
    return ctx.getImageData(0,0,width,height);
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
    var x, y, sx, sy, cx, cy, scy, scx, dstOff, srcOff, wt, r, g, b, a;
    var output = Filters.createImageData(width, height);
    var dst = output.data;
    // go through the destination image pixels
    for (y=0; y<h; y++) {
      for (x=0; x<w; x++) {
        sy = y;
        sx = x;
        dstOff = (y*w+x)*4;
        // calculate the weighed sum of the source image pixels that
        // fall under the convolution matrix
        r=0, g=0, b=0, a=0;
        for (cy=0; cy<side; cy++) {
          for (cx=0; cx<side; cx++) {
            scy = sy + cy - halfSide;
            scx = sx + cx - halfSide;
            if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
              srcOff = (scy*sw+scx)*4;
              wt = weights[cy*side+cx];
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

module.exports = function (context, config, filterData, width, height) {

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

    var colors = hexToRgb(color, 1);

    if (context) {
      drawLine(dateTab, y, colors, context);
    }
  };

  function drawLine(dates, coorY, colors, context) {
    var points = dates.map(function(date) {
      return { x: config.xScale(date), y: coorY, size: 15 };
    });

    function update() {
      var start = (new Date()).getTime();
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
      //console.log((new Date()).getTime()-start, 'ms for draw');
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwibGliL2RlbGltaXRlci5qcyIsImxpYi9ldmVudERyb3BzLmpzIiwibGliL2V2ZW50TGluZS5qcyIsImxpYi9maWx0ZXJEYXRhLmpzIiwibGliL2ZpbHRlckxpbmluZy5qcyIsImxpYi9tYWluLmpzIiwibGliL21ldGFiYWxpemluZ1Rvb2xzLmpzIiwibGliL3V0aWwvY29uZmlndXJhYmxlLmpzIiwibGliL3hBeGlzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlwidXNlIHN0cmljdFwiO1xuLyogZ2xvYmFsIHJlcXVpcmUsIG1vZHVsZSwgZDMgKi9cblxudmFyIGNvbmZpZ3VyYWJsZSA9IHJlcXVpcmUoJy4vdXRpbC9jb25maWd1cmFibGUnKTtcblxudmFyIGRlZmF1bHRDb25maWcgPSB7XG4gIHhTY2FsZTogbnVsbCxcbiAgZGF0ZUZvcm1hdDogbnVsbFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZDMpIHtcblxuICByZXR1cm4gZnVuY3Rpb24gKGNvbmZpZykge1xuXG4gICAgY29uZmlnID0gY29uZmlnIHx8IHt9O1xuICAgIGZvciAodmFyIGtleSBpbiBkZWZhdWx0Q29uZmlnKSB7XG4gICAgICBjb25maWdba2V5XSA9IGNvbmZpZ1trZXldIHx8IGRlZmF1bHRDb25maWdba2V5XTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBkZWxpbWl0ZXIoc2VsZWN0aW9uKSB7XG4gICAgICBzZWxlY3Rpb24uZWFjaChmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICBkMy5zZWxlY3QodGhpcykuc2VsZWN0QWxsKCd0ZXh0JykucmVtb3ZlKCk7XG5cbiAgICAgICAgdmFyIGxpbWl0cyA9IGNvbmZpZy54U2NhbGUuZG9tYWluKCk7XG5cbiAgICAgICAgZDMuc2VsZWN0KHRoaXMpLmFwcGVuZCgndGV4dCcpXG4gICAgICAgICAgLnRleHQoZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICByZXR1cm4gY29uZmlnLmRhdGVGb3JtYXQobGltaXRzWzBdKTtcbiAgICAgICAgICB9KVxuICAgICAgICAgIC5jbGFzc2VkKCdzdGFydCcsIHRydWUpXG4gICAgICAgIDtcblxuICAgICAgICBkMy5zZWxlY3QodGhpcykuYXBwZW5kKCd0ZXh0JylcbiAgICAgICAgICAudGV4dChmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgIHJldHVybiBjb25maWcuZGF0ZUZvcm1hdChsaW1pdHNbMV0pO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLmF0dHIoJ3RleHQtYW5jaG9yJywgJ2VuZCcpXG4gICAgICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoJyArIGNvbmZpZy54U2NhbGUucmFuZ2UoKVsxXSArICcpJylcbiAgICAgICAgICAuY2xhc3NlZCgnZW5kJywgdHJ1ZSlcbiAgICAgICAgO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgY29uZmlndXJhYmxlKGRlbGltaXRlciwgY29uZmlnKTtcblxuICAgIHJldHVybiBkZWxpbWl0ZXI7XG4gIH07XG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vKiBnbG9iYWwgcmVxdWlyZSwgbW9kdWxlICovXG5cbnZhciBjb25maWd1cmFibGUgPSByZXF1aXJlKCcuL3V0aWwvY29uZmlndXJhYmxlJyk7XG52YXIgeEF4aXNGYWN0b3J5ID0gcmVxdWlyZSgnLi94QXhpcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChkMywgZG9jdW1lbnQpIHtcbiAgdmFyIGRlbGltaXRlciA9IHJlcXVpcmUoJy4vZGVsaW1pdGVyJykoZDMpO1xuICB2YXIgZmlsdGVyRGF0YSA9IHJlcXVpcmUoJy4vZmlsdGVyRGF0YScpO1xuXG4gIHZhciBkZWZhdWx0Q29uZmlnID0ge1xuXHRcdHN0YXJ0OiBuZXcgRGF0ZSgwKSxcblx0XHRlbmQ6IG5ldyBEYXRlKCksXG5cdFx0bWluU2NhbGU6IDAsXG5cdFx0bWF4U2NhbGU6IEluZmluaXR5LFxuXHRcdHdpZHRoOiAxMDAwLFxuXHRcdG1hcmdpbjoge1xuXHRcdCAgdG9wOiA2MCxcblx0XHQgIGxlZnQ6IDIwMCxcblx0XHQgIGJvdHRvbTogNDAsXG5cdFx0ICByaWdodDogNTBcblx0XHR9LFxuXHRcdGxvY2FsZTogbnVsbCxcblx0XHRheGlzRm9ybWF0OiBudWxsLFxuXHRcdHRpY2tGb3JtYXQ6IFtcblx0XHRcdFtcIi4lTFwiLCBmdW5jdGlvbihkKSB7IHJldHVybiBkLmdldE1pbGxpc2Vjb25kcygpOyB9XSxcblx0XHRcdFtcIjolU1wiLCBmdW5jdGlvbihkKSB7IHJldHVybiBkLmdldFNlY29uZHMoKTsgfV0sXG5cdFx0XHRbXCIlSTolTVwiLCBmdW5jdGlvbihkKSB7IHJldHVybiBkLmdldE1pbnV0ZXMoKTsgfV0sXG5cdFx0XHRbXCIlSSAlcFwiLCBmdW5jdGlvbihkKSB7IHJldHVybiBkLmdldEhvdXJzKCk7IH1dLFxuXHRcdFx0W1wiJWEgJWRcIiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gZC5nZXREYXkoKSAmJiBkLmdldERhdGUoKSAhPSAxOyB9XSxcblx0XHRcdFtcIiViICVkXCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQuZ2V0RGF0ZSgpICE9IDE7IH1dLFxuXHRcdFx0W1wiJUJcIiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gZC5nZXRNb250aCgpOyB9XSxcblx0XHRcdFtcIiVZXCIsIGZ1bmN0aW9uKCkgeyByZXR1cm4gdHJ1ZTsgfV1cblx0XHRdLFxuXHRcdGV2ZW50SG92ZXI6IG51bGwsXG5cdFx0ZXZlbnRab29tOiBudWxsLFxuXHRcdGV2ZW50Q2xpY2s6IG51bGwsXG5cdFx0aGFzRGVsaW1pdGVyOiB0cnVlLFxuXHRcdGhhc1RvcEF4aXM6IHRydWUsXG5cdFx0aGFzQm90dG9tQXhpczogZnVuY3Rpb24gKGRhdGEpIHtcblx0XHQgIHJldHVybiBkYXRhLmxlbmd0aCA+PSAxMDtcblx0XHR9LFxuXHRcdGV2ZW50TGluZUNvbG9yOiAnYmxhY2snLFxuXHRcdGV2ZW50Q29sb3I6IG51bGxcbiAgfTtcblxuICByZXR1cm4gZnVuY3Rpb24gZXZlbnREcm9wcyhjb25maWcpIHtcblx0XHR2YXIgeFNjYWxlID0gZDMudGltZS5zY2FsZSgpO1xuXHRcdHZhciB5U2NhbGUgPSBkMy5zY2FsZS5vcmRpbmFsKCk7XG5cdFx0Y29uZmlnID0gY29uZmlnIHx8IHt9O1xuXHRcdGZvciAodmFyIGtleSBpbiBkZWZhdWx0Q29uZmlnKSB7XG5cdFx0ICBjb25maWdba2V5XSA9IGNvbmZpZ1trZXldIHx8IGRlZmF1bHRDb25maWdba2V5XTtcblx0XHR9XG5cblx0XHRmdW5jdGlvbiBldmVudERyb3BHcmFwaChzZWxlY3Rpb24pIHtcblx0XHQgIHNlbGVjdGlvbi5lYWNoKGZ1bmN0aW9uIChkYXRhKSB7XG5cdFx0XHRcdHZhciB6b29tID0gZDMuYmVoYXZpb3Iuem9vbSgpLmNlbnRlcihudWxsKS5zY2FsZUV4dGVudChbY29uZmlnLm1pblNjYWxlLCBjb25maWcubWF4U2NhbGVdKS5vbihcInpvb21cIiwgdXBkYXRlWm9vbSk7XG5cdFx0XHRcdHpvb20ub24oXCJ6b29tZW5kXCIsIHpvb21FbmQpO1xuXG4gICAgICAgIHZhciBncmFwaFdpZHRoID0gY29uZmlnLndpZHRoIC0gY29uZmlnLm1hcmdpbi5yaWdodCAtIGNvbmZpZy5tYXJnaW4ubGVmdDtcbiAgICAgICAgdmFyIGdyYXBoSGVpZ2h0ID0gZGF0YS5sZW5ndGggKiA0MDtcbiAgICAgICAgdmFyIGhlaWdodCA9IGdyYXBoSGVpZ2h0ICsgY29uZmlnLm1hcmdpbi50b3AgKyBjb25maWcubWFyZ2luLmJvdHRvbTtcbiAgICAgICAgdmFyIHhBeGlzVG9wLCB4QXhpc0JvdHRvbTtcblxuICAgICAgICB2YXIgYmFzZSA9IGQzLnNlbGVjdCh0aGlzKTtcblxuXHRcdFx0XHRiYXNlLnNlbGVjdCgnY2FudmFzJykucmVtb3ZlKCk7XG4gIFx0XHRcdHZhciBjYW52YXMgPSBiYXNlXG4gIFx0XHRcdCAgLmFwcGVuZCgnY2FudmFzJylcbiAgXHRcdFx0ICAuYXR0cignaWQnLCBcIm1vbl9jYW52YXNcIilcbiAgXHRcdFx0ICAuYXR0cignd2lkdGgnLCBncmFwaFdpZHRoKVxuICBcdFx0XHQgIC5hdHRyKCdoZWlnaHQnLCBncmFwaEhlaWdodCk7XG5cbiAgXHRcdCAgdmFyIGN0eCA9IChjYW52YXMubm9kZSgpKS5nZXRDb250ZXh0KCcyZCcpO1xuXG4gICAgICAgIHZhciBldmVudExpbmUgPSByZXF1aXJlKCcuL2V2ZW50TGluZScpKGQzLCBjdHgsIGdyYXBoV2lkdGgsIGdyYXBoSGVpZ2h0KTtcbiAgICAgICAgdmFyIEZpbHRlckZhY3RvcnkgPSByZXF1aXJlKCcuL2ZpbHRlckxpbmluZycpKGN0eCwgZ3JhcGhXaWR0aCwgZ3JhcGhIZWlnaHQpO1xuXG4gIFx0XHRcdGJhc2Uuc2VsZWN0KCdzdmcnKS5yZW1vdmUoKTtcblxuICBcdFx0XHR2YXIgc3ZnID0gYmFzZVxuICBcdFx0XHQgIC5hcHBlbmQoJ3N2ZycpXG4gIFx0XHRcdCAgLmF0dHIoJ3dpZHRoJywgY29uZmlnLndpZHRoKVxuICBcdFx0XHQgIC5hdHRyKCdoZWlnaHQnLCBoZWlnaHQpXG4gIFx0XHRcdDtcblxuICBcdFx0XHR2YXIgZ3JhcGggPSBzdmcuYXBwZW5kKCdnJylcbiAgXHRcdFx0ICAuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgwLCAyNSknKTtcblxuICBcdFx0XHR2YXIgeURvbWFpbiA9IFtdO1xuICBcdFx0XHR2YXIgeVJhbmdlID0gW107XG5cbiAgXHRcdFx0ZGF0YS5mb3JFYWNoKGZ1bmN0aW9uIChldmVudCwgaW5kZXgpIHtcbiAgXHRcdFx0ICB5RG9tYWluLnB1c2goZXZlbnQubmFtZSk7XG4gIFx0XHRcdCAgeVJhbmdlLnB1c2goaW5kZXggKiA0MCk7XG4gIFx0XHRcdH0pO1xuXG4gIFx0XHRcdHlTY2FsZS5kb21haW4oeURvbWFpbikucmFuZ2UoeVJhbmdlKTtcblxuICBcdFx0XHR2YXIgeUF4aXNFbCA9IGdyYXBoLmFwcGVuZCgnZycpXG4gIFx0XHRcdCAgLmNsYXNzZWQoJ3ktYXhpcycsIHRydWUpXG4gIFx0XHRcdCAgLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoMCwgNjApJyk7XG5cbiAgXHRcdFx0dmFyIHlUaWNrID0geUF4aXNFbC5hcHBlbmQoJ2cnKS5zZWxlY3RBbGwoJ2cnKS5kYXRhKHlEb21haW4pO1xuXG4gIFx0XHRcdHlUaWNrLmVudGVyKClcbiAgXHRcdFx0ICAuYXBwZW5kKCdnJylcbiAgXHRcdFx0ICAuYXR0cigndHJhbnNmb3JtJywgZnVuY3Rpb24oZCkge1xuICBcdFx0XHRcdHJldHVybiAndHJhbnNsYXRlKDAsICcgKyB5U2NhbGUoZCkgKyAnKSc7XG4gIFx0XHRcdCAgfSlcbiAgXHRcdFx0ICAuYXBwZW5kKCdsaW5lJylcbiAgXHRcdFx0ICAuY2xhc3NlZCgneS10aWNrJywgdHJ1ZSlcbiAgXHRcdFx0ICAuYXR0cigneDEnLCBjb25maWcubWFyZ2luLmxlZnQpXG4gIFx0XHRcdCAgLmF0dHIoJ3gyJywgY29uZmlnLm1hcmdpbi5sZWZ0ICsgZ3JhcGhXaWR0aCk7XG5cblx0XHRcdCAgeVRpY2suZXhpdCgpLnJlbW92ZSgpO1xuXG4gIFx0XHRcdHZhciBjdXJ4LCBjdXJ5O1xuICBcdFx0XHR2YXIgem9vbVJlY3QgPSBzdmdcbiAgXHRcdFx0ICAuYXBwZW5kKCdyZWN0JylcbiAgXHRcdFx0ICAuY2FsbCh6b29tKVxuICBcdFx0XHQgIC5jbGFzc2VkKCd6b29tJywgdHJ1ZSlcbiAgXHRcdFx0ICAuYXR0cignd2lkdGgnLCBncmFwaFdpZHRoKVxuICBcdFx0XHQgIC5hdHRyKCdoZWlnaHQnLCBoZWlnaHQgKVxuICBcdFx0XHQgIC5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCcgKyBjb25maWcubWFyZ2luLmxlZnQgKyAnLCAzNSknKVxuICBcdFx0XHQ7XG5cbiAgXHRcdFx0aWYgKHR5cGVvZiBjb25maWcuZXZlbnRIb3ZlciA9PT0gJ2Z1bmN0aW9uJykge1xuICBcdFx0XHQgIHpvb21SZWN0Lm9uKCdtb3VzZW1vdmUnLCBmdW5jdGlvbihkLCBlKSB7XG4gIFx0XHRcdFx0dmFyIGV2ZW50ID0gZDMuZXZlbnQ7XG4gIFx0XHRcdFx0aWYgKGN1cnggPT0gZXZlbnQuY2xpZW50WCAmJiBjdXJ5ID09IGV2ZW50LmNsaWVudFkpIHJldHVybjtcbiAgXHRcdFx0XHRjdXJ4ID0gZXZlbnQuY2xpZW50WDtcbiAgXHRcdFx0XHRjdXJ5ID0gZXZlbnQuY2xpZW50WTtcbiAgXHRcdFx0XHR6b29tUmVjdC5hdHRyKCdkaXNwbGF5JywgJ25vbmUnKTtcbiAgXHRcdFx0XHR2YXIgZWwgPSBkb2N1bWVudC5lbGVtZW50RnJvbVBvaW50KGQzLmV2ZW50LmNsaWVudFgsIGQzLmV2ZW50LmNsaWVudFkpO1xuICBcdFx0XHRcdHpvb21SZWN0LmF0dHIoJ2Rpc3BsYXknLCAnYmxvY2snKTtcbiAgXHRcdFx0XHRpZiAoZWwudGFnTmFtZSAhPT0gJ2NpcmNsZScpIHJldHVybjtcbiAgXHRcdFx0XHRjb25maWcuZXZlbnRIb3ZlcihlbCk7XG4gIFx0XHRcdCAgfSk7XG4gIFx0XHRcdH1cblxuICBcdFx0XHRpZiAodHlwZW9mIGNvbmZpZy5ldmVudENsaWNrID09PSAnZnVuY3Rpb24nKSB7XG4gIFx0XHRcdCAgem9vbVJlY3Qub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuICBcdFx0XHRcdHpvb21SZWN0LmF0dHIoJ2Rpc3BsYXknLCAnbm9uZScpO1xuICBcdFx0XHRcdHZhciBlbCA9IGRvY3VtZW50LmVsZW1lbnRGcm9tUG9pbnQoZDMuZXZlbnQuY2xpZW50WCwgZDMuZXZlbnQuY2xpZW50WSk7XG4gIFx0XHRcdFx0em9vbVJlY3QuYXR0cignZGlzcGxheScsICdibG9jaycpO1xuICBcdFx0XHRcdGlmIChlbC50YWdOYW1lICE9PSAnY2lyY2xlJykgcmV0dXJuO1xuICBcdFx0XHRcdGNvbmZpZy5ldmVudENsaWNrKGVsKTtcbiAgXHRcdFx0ICB9KTtcbiAgXHRcdFx0fVxuXG4gICAgICAgIHhTY2FsZS5yYW5nZShbMCwgZ3JhcGhXaWR0aF0pLmRvbWFpbihbY29uZmlnLnN0YXJ0LCBjb25maWcuZW5kXSk7XG5cbiAgICAgICAgem9vbS54KHhTY2FsZSk7XG5cbiAgICAgICAgZnVuY3Rpb24gdXBkYXRlWm9vbSgpIHtcbiAgICAgICAgICBpZiAoZDMuZXZlbnQuc291cmNlRXZlbnQgJiYgZDMuZXZlbnQuc291cmNlRXZlbnQudG9TdHJpbmcoKSA9PT0gJ1tvYmplY3QgTW91c2VFdmVudF0nKSB7XG4gICAgICAgICAgICB6b29tLnRyYW5zbGF0ZShbZDMuZXZlbnQudHJhbnNsYXRlWzBdLCAwXSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKGQzLmV2ZW50LnNvdXJjZUV2ZW50ICYmIGQzLmV2ZW50LnNvdXJjZUV2ZW50LnRvU3RyaW5nKCkgPT09ICdbb2JqZWN0IFdoZWVsRXZlbnRdJykge1xuICAgICAgICAgICAgem9vbS5zY2FsZShkMy5ldmVudC5zY2FsZSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJlZHJhdygpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gaW5pdGlhbGl6YXRpb24gb2YgdGhlIGRlbGltaXRlclxuICAgICAgICBzdmcuc2VsZWN0KCcuZGVsaW1pdGVyJykucmVtb3ZlKCk7XG4gICAgICAgIHZhciBkZWxpbWl0ZXJFbCA9IHN2Z1xuICAgICAgICAgIC5hcHBlbmQoJ2cnKVxuICAgICAgICAgIC5jbGFzc2VkKCdkZWxpbWl0ZXInLCB0cnVlKVxuICAgICAgICAgIC5hdHRyKCd3aWR0aCcsIGdyYXBoV2lkdGgpXG4gICAgICAgICAgLmF0dHIoJ2hlaWdodCcsIDEwKVxuICAgICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCcgKyBjb25maWcubWFyZ2luLmxlZnQgKyAnLCAnICsgKGNvbmZpZy5tYXJnaW4udG9wIC0gNDUpICsgJyknKVxuICAgICAgICAgIC5jYWxsKGRlbGltaXRlcih7XG4gICAgICAgICAgICB4U2NhbGU6IHhTY2FsZSxcbiAgICAgICAgICAgIGRhdGVGb3JtYXQ6IGNvbmZpZy5sb2NhbGUgPyBjb25maWcubG9jYWxlLnRpbWVGb3JtYXQoXCIlZCAlQiAlWVwiKSA6IGQzLnRpbWUuZm9ybWF0KFwiJWQgJUIgJVlcIilcbiAgICAgICAgICB9KSlcbiAgICAgICAgO1xuXG4gICAgICAgIGZ1bmN0aW9uIHJlZHJhd0RlbGltaXRlcigpIHtcbiAgICAgICAgICBkZWxpbWl0ZXJFbC5jYWxsKGRlbGltaXRlcih7XG4gICAgICAgICAgICB4U2NhbGU6IHhTY2FsZSxcbiAgICAgICAgICAgIGRhdGVGb3JtYXQ6IGNvbmZpZy5sb2NhbGUgPyBjb25maWcubG9jYWxlLnRpbWVGb3JtYXQoXCIlZCAlQiAlWVwiKSA6IGQzLnRpbWUuZm9ybWF0KFwiJWQgJUIgJVlcIilcbiAgICAgICAgICB9KSk7XG4gICAgICAgIH1cblxuICBcdFx0XHRmdW5jdGlvbiB6b29tRW5kKCkge1xuICBcdFx0XHQgIGlmIChjb25maWcuZXZlbnRab29tKSB7XG4gIFx0XHRcdFx0ICBjb25maWcuZXZlbnRab29tKHhTY2FsZSk7XG4gIFx0XHRcdCAgfVxuICBcdFx0XHQgIGlmIChjb25maWcuaGFzRGVsaW1pdGVyKSB7XG4gIFx0XHRcdFx0ICByZWRyYXdEZWxpbWl0ZXIoKTtcbiAgXHRcdFx0ICB9XG4gIFx0XHRcdH1cblxuICAgICAgICB2YXIgaGFzVG9wQXhpcyA9IHR5cGVvZiBjb25maWcuaGFzVG9wQXhpcyA9PT0gJ2Z1bmN0aW9uJyA/IGNvbmZpZy5oYXNUb3BBeGlzKGRhdGEpIDogY29uZmlnLmhhc1RvcEF4aXM7XG4gICAgICAgIGlmIChoYXNUb3BBeGlzKSB7XG4gICAgICAgICAgeEF4aXNUb3AgPSB4QXhpc0ZhY3RvcnkoZDMsIGNvbmZpZywgeFNjYWxlLCBncmFwaCwgZ3JhcGhIZWlnaHQsICd0b3AnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBoYXNCb3R0b21BeGlzID0gdHlwZW9mIGNvbmZpZy5oYXNCb3R0b21BeGlzID09PSAnZnVuY3Rpb24nID8gY29uZmlnLmhhc0JvdHRvbUF4aXMoZGF0YSkgOiBjb25maWcuaGFzQm90dG9tQXhpcztcbiAgICAgICAgaWYgKGhhc0JvdHRvbUF4aXMpIHtcbiAgICAgICAgICB4QXhpc0JvdHRvbSA9IHhBeGlzRmFjdG9yeShkMywgY29uZmlnLCB4U2NhbGUsIGdyYXBoLCBncmFwaEhlaWdodCwgJ2JvdHRvbScpO1xuICAgICAgICB9XG5cbiAgXHRcdFx0ZnVuY3Rpb24gZHJhd1hBeGlzKHdoZXJlKSB7XG4gIFx0XHRcdCAgLy8gY29weSBjb25maWcudGlja0Zvcm1hdCBiZWNhdXNlIGQzIGZvcm1hdC5tdWx0aSBlZGl0IGl0cyBnaXZlbiB0aWNrRm9ybWF0IGRhdGFcbiAgXHRcdFx0ICB2YXIgdGlja0Zvcm1hdERhdGEgPSBbXTtcblxuICBcdFx0XHQgIGNvbmZpZy50aWNrRm9ybWF0LmZvckVhY2goZnVuY3Rpb24gKGl0ZW0pIHtcbiAgXHRcdFx0XHQgIHZhciB0aWNrID0gaXRlbS5zbGljZSgwKTtcbiAgXHRcdFx0XHQgIHRpY2tGb3JtYXREYXRhLnB1c2godGljayk7XG4gIFx0XHRcdCAgfSk7XG5cbiAgXHRcdFx0ICB2YXIgdGlja0Zvcm1hdCA9IGNvbmZpZy5sb2NhbGUgPyBjb25maWcubG9jYWxlLnRpbWVGb3JtYXQubXVsdGkodGlja0Zvcm1hdERhdGEpIDogZDMudGltZS5mb3JtYXQubXVsdGkodGlja0Zvcm1hdERhdGEpO1xuICBcdFx0XHQgIHZhciB4QXhpcyA9IGQzLnN2Zy5heGlzKClcbiAgXHRcdFx0XHQgIC5zY2FsZSh4U2NhbGUpXG4gIFx0XHRcdFx0ICAub3JpZW50KHdoZXJlKVxuICBcdFx0XHRcdCAgLnRpY2tGb3JtYXQodGlja0Zvcm1hdClcbiAgXHRcdFx0ICA7XG5cbiAgXHRcdFx0ICBpZiAodHlwZW9mIGNvbmZpZy5heGlzRm9ybWF0ID09PSAnZnVuY3Rpb24nKSB7XG4gIFx0XHRcdFx0ICBjb25maWcuYXhpc0Zvcm1hdCh4QXhpcyk7XG4gIFx0XHRcdCAgfVxuXG4gIFx0XHRcdCAgdmFyIHkgPSAod2hlcmUgPT0gJ2JvdHRvbScgPyBwYXJzZUludChncmFwaEhlaWdodCkgOiAwKSArIGNvbmZpZy5tYXJnaW4udG9wIC0gNDA7XG5cbiAgXHRcdFx0ICBncmFwaC5zZWxlY3QoJy54LWF4aXMuJyArIHdoZXJlKS5yZW1vdmUoKTtcbiAgXHRcdFx0ICB2YXIgeEF4aXNFbCA9IGdyYXBoXG4gICAgXHRcdFx0XHQuYXBwZW5kKCdnJylcbiAgICBcdFx0XHRcdC5jbGFzc2VkKCd4LWF4aXMnLCB0cnVlKVxuICAgIFx0XHRcdFx0LmNsYXNzZWQod2hlcmUsIHRydWUpXG4gICAgXHRcdFx0XHQuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgnICsgY29uZmlnLm1hcmdpbi5sZWZ0ICsgJywgJyArIHkgKyAnKScpXG4gICAgXHRcdFx0XHQuY2FsbCh4QXhpcylcbiAgXHRcdFx0ICA7XG4gIFx0XHRcdH1cblxuICBcdFx0XHQvLyBpbml0aWFsaXphdGlvbiBvZiB0aGUgZ3JhcGggYm9keVxuICAgICAgICB6b29tLnNpemUoW2NvbmZpZy53aWR0aCwgaGVpZ2h0XSk7XG5cbiAgICAgICAgZ3JhcGguc2VsZWN0KCcuZ3JhcGgtYm9keScpLnJlbW92ZSgpO1xuICAgICAgICB2YXIgZ3JhcGhCb2R5ID0gZ3JhcGhcbiAgICAgICAgICAuYXBwZW5kKCdnJylcbiAgICAgICAgICAuY2xhc3NlZCgnZ3JhcGgtYm9keScsIHRydWUpXG4gICAgICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoJyArIGNvbmZpZy5tYXJnaW4ubGVmdCArICcsICcgKyAoY29uZmlnLm1hcmdpbi50b3AgLSAxNSkgKyAnKScpO1xuXG4gICAgICAgIHZhciBsaW5lcyA9IGdyYXBoQm9keS5zZWxlY3RBbGwoJ2cnKS5kYXRhKGRhdGEpO1xuXG4gICAgICAgIGxpbmVzLmVudGVyKClcbiAgICAgICAgICAuYXBwZW5kKCdnJylcbiAgICAgICAgICAuY2xhc3NlZCgnbGluZScsIHRydWUpXG4gICAgICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsIGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICAgIHJldHVybiAndHJhbnNsYXRlKDAsJyArIHlTY2FsZShkLm5hbWUpICsgJyknO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLnN0eWxlKCdmaWxsJywgY29uZmlnLmV2ZW50TGluZUNvbG9yKVxuICAgICAgICAgIC5jYWxsKGV2ZW50TGluZSh7IHhTY2FsZTogeFNjYWxlLCBldmVudENvbG9yOiBjb25maWcuZXZlbnRDb2xvciB9KSlcbiAgICAgICAgO1xuXG4gICAgICAgIGxpbmVzLmV4aXQoKS5yZW1vdmUoKTtcblxuICAgICAgICBmdW5jdGlvbiByZWRyYXcoKSB7XG4gICAgICAgICAgLy8gU3RvcmUgdGhlIGN1cnJlbnQgdHJhbnNmb3JtYXRpb24gbWF0cml4XG4gICAgICAgICAgY3R4LnNhdmUoKTtcbiAgICAgICAgICAvLyBTZXQgYmFjayB0byB0aGUgb3JpZ2luYWwgY2FudmFzXG4gICAgICAgICAgY3R4LnNldFRyYW5zZm9ybSgxLCAwLCAwLCAxLCAwLCAwKTtcbiAgICAgICAgICAvLyBDbGVhciB0aGUgY2FudmFzXG4gICAgICAgICAgY3R4LmNsZWFyUmVjdCgwLCAwLCBncmFwaFdpZHRoLCBncmFwaEhlaWdodCk7XG4gICAgICAgICAgLy8gUmVzdG9yZSB0aGUgZm9ybWVyIGNvb3JkaW5hdGVzXG4gICAgICAgICAgY3R4LnJlc3RvcmUoKTtcblxuICAgICAgICAgIHZhciBoYXNUb3BBeGlzID0gdHlwZW9mIGNvbmZpZy5oYXNUb3BBeGlzID09PSAnZnVuY3Rpb24nID8gY29uZmlnLmhhc1RvcEF4aXMoZGF0YSkgOiBjb25maWcuaGFzVG9wQXhpcztcbiAgICAgICAgICBpZiAoaGFzVG9wQXhpcykge1xuICAgICAgICAgICAgeEF4aXNUb3AuZHJhd1hBeGlzKCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdmFyIGhhc0JvdHRvbUF4aXMgPSB0eXBlb2YgY29uZmlnLmhhc0JvdHRvbUF4aXMgPT09ICdmdW5jdGlvbicgPyBjb25maWcuaGFzQm90dG9tQXhpcyhkYXRhKSA6IGNvbmZpZy5oYXNCb3R0b21BeGlzO1xuICAgICAgICAgIGlmIChoYXNCb3R0b21BeGlzKSB7XG4gICAgICAgICAgICB4QXhpc0JvdHRvbS5kcmF3WEF4aXMoKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBsaW5lcy5jYWxsKGV2ZW50TGluZSh7IHhTY2FsZTogeFNjYWxlLCB5U2NhbGU6IHlTY2FsZSwgZXZlbnRMaW5lQ29sb3I6IGNvbmZpZy5ldmVudExpbmVDb2xvcn0pKTtcblxuICAgICAgICAgIGZ1bmN0aW9uIG1ldGFiYWxpemUoKSB7XG4gICAgICAgICAgICB2YXIgdGhyZXNob2xkID0gMTgwO1xuICAgICAgICAgICAgdmFyIHN0YXJ0ID0gKG5ldyBEYXRlKCkpLmdldFRpbWUoKTtcbiAgICAgICAgICAgIHZhciBpbWFnZURhdGEgPSBjdHguZ2V0SW1hZ2VEYXRhKDAsMCxncmFwaFdpZHRoLGdyYXBoSGVpZ2h0KTtcbiAgICAgICAgICAgIHZhciBwaXggPSBpbWFnZURhdGEuZGF0YTtcblxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIG4gPSBwaXgubGVuZ3RoOyBpIDwgbjsgaSArPSA0KSB7XG4gICAgICAgICAgICAgIHBpeFtpICsgM10gPSBwaXhbaSszXSA8IHRocmVzaG9sZCA/IDAgOiAyNTU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjdHgucHV0SW1hZ2VEYXRhKGltYWdlRGF0YSwgMCwgMCk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKChuZXcgRGF0ZSgpKS5nZXRUaW1lKCktc3RhcnQsICdtcyBmb3IgdGhyZXNob2xkJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbWV0YWJhbGl6ZSgpO1xuXG4gICAgICAgICAgLy8gQXBwbHlpbmcgdGhlIGxpbmluZyBmaWx0ZXIgdG8gdGhlIGNhbnZhc1xuICAgICAgICAgIEZpbHRlckZhY3RvcnkuZmlsdGVyKCk7XG4gIFx0XHRcdH1cblxuICBcdFx0XHRyZWRyYXcoKTtcbiAgXHRcdFx0aWYgKGNvbmZpZy5oYXNEZWxpbWl0ZXIpIHtcbiAgXHRcdFx0ICByZWRyYXdEZWxpbWl0ZXIoKTtcbiAgXHRcdFx0fVxuICBcdFx0XHRpZiAoY29uZmlnLmV2ZW50Wm9vbSkge1xuICBcdFx0XHQgIGNvbmZpZy5ldmVudFpvb20oeFNjYWxlKTtcbiAgXHRcdFx0fVxuXHRcdCAgfSk7XG5cdFx0fVxuXHRcdGNvbmZpZ3VyYWJsZShldmVudERyb3BHcmFwaCwgY29uZmlnKTtcblxuXHRcdHJldHVybiBldmVudERyb3BHcmFwaDtcbiAgfTtcbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcbi8qIGdsb2JhbCByZXF1aXJlLCBtb2R1bGUsIGQzICovXG5cbnZhciBjb25maWd1cmFibGUgPSByZXF1aXJlKCcuL3V0aWwvY29uZmlndXJhYmxlJyk7XG52YXIgZmlsdGVyRGF0YSA9IHJlcXVpcmUoJy4vZmlsdGVyRGF0YScpO1xuXG52YXIgZGVmYXVsdENvbmZpZyA9IHtcbiAgeFNjYWxlOiBudWxsLFxuICB5U2NhbGU6IG51bGxcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGQzLCBjb250ZXh0LCB3aWR0aCwgaGVpZ2h0KSB7XG4gIHJldHVybiBmdW5jdGlvbiAoY29uZmlnKSB7XG5cbiAgICBjb25maWcgPSBjb25maWcgfHwge1xuICAgICAgeFNjYWxlOiBudWxsLFxuICAgICAgeVNjYWxlOiBudWxsLFxuICAgICAgZXZlbnRMaW5lQ29sb3I6ICdibGFjaycsXG4gICAgICB3aWR0aDogMCxcbiAgICAgIGhlaWdodDogMFxuICAgIH07XG4gICAgZm9yICh2YXIga2V5IGluIGRlZmF1bHRDb25maWcpIHtcbiAgICAgIGNvbmZpZ1trZXldID0gY29uZmlnW2tleV0gfHwgZGVmYXVsdENvbmZpZ1trZXldO1xuICAgIH1cblxuICAgIHZhciBldmVudExpbmUgPSBmdW5jdGlvbiBldmVudExpbmUoc2VsZWN0aW9uKSB7XG4gICAgICBzZWxlY3Rpb24uZWFjaChmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICBkMy5zZWxlY3QodGhpcykuc2VsZWN0QWxsKCd0ZXh0JykucmVtb3ZlKCk7XG5cbiAgICAgICAgZDMuc2VsZWN0KHRoaXMpLmFwcGVuZCgndGV4dCcpXG4gICAgICAgICAgLnRleHQoZnVuY3Rpb24oZCkge1xuICAgICAgICAgICAgdmFyIGNvdW50ID0gZmlsdGVyRGF0YShkLmRhdGVzLCBjb25maWcueFNjYWxlKS5sZW5ndGg7XG4gICAgICAgICAgICByZXR1cm4gZC5uYW1lICsgKGNvdW50ID4gMCA/ICcgKCcgKyBjb3VudCArICcpJyA6ICcnKTtcbiAgICAgICAgICB9KVxuICAgICAgICAgIC5hdHRyKCd0ZXh0LWFuY2hvcicsICdlbmQnKVxuICAgICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKC0yMCknKVxuICAgICAgICAgIC5zdHlsZSgnZmlsbCcsICdibGFjaycpXG4gICAgICAgIDtcblxuICAgICAgICB2YXIgZGF0YUNvbnRhaW5lciA9IGQzLnNlbGVjdChcImJvZHlcIikuYXBwZW5kKCdjdXN0b20nKTtcblxuICAgICAgICB2YXIgTWV0YWJhbGxGYWN0b3J5ID0gcmVxdWlyZSgnLi9tZXRhYmFsaXppbmdUb29scycpKGNvbnRleHQsIGNvbmZpZywgZmlsdGVyRGF0YSwgd2lkdGgsIGhlaWdodCk7XG5cbiAgICAgICAgTWV0YWJhbGxGYWN0b3J5LmRyYXdDdXN0b20oZGF0YSk7XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgY29uZmlndXJhYmxlKGV2ZW50TGluZSwgY29uZmlnKTtcblxuICAgIHJldHVybiBldmVudExpbmU7XG4gIH07XG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vKiBnbG9iYWwgbW9kdWxlICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZmlsdGVyRGF0ZShkYXRhLCBzY2FsZSkge1xuICBkYXRhID0gZGF0YSB8fCBbXTtcbiAgdmFyIGJvdW5kYXJ5ID0gc2NhbGUucmFuZ2UoKTtcbiAgdmFyIG1pbiA9IGJvdW5kYXJ5WzBdO1xuICB2YXIgbWF4ID0gYm91bmRhcnlbMV07XG5cbiAgcmV0dXJuIGRhdGEuZmlsdGVyKGZ1bmN0aW9uIChkYXR1bSkge1xuICAgIHZhciB2YWx1ZSA9IHNjYWxlKGRhdHVtKTtcbiAgICByZXR1cm4gISh2YWx1ZSA8IG1pbiB8fCB2YWx1ZSA+IG1heCk7XG4gIH0pO1xufTtcbiIsIlwidXNlIHN0cmljdFwiO1xuLyogZ2xvYmFsIHJlcXVpcmUsIG1vZHVsZSAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjdHgsIHdpZHRoLCBoZWlnaHQpIHtcblxuICB2YXIgRmlsdGVycyA9IHt9O1xuICBGaWx0ZXJzLmdldFBpeGVscyA9IGZ1bmN0aW9uKGN0eCkge1xuICAgIHJldHVybiBjdHguZ2V0SW1hZ2VEYXRhKDAsMCx3aWR0aCxoZWlnaHQpO1xuICB9O1xuXG4gIEZpbHRlcnMuZmlsdGVySW1hZ2UgPSBmdW5jdGlvbihmaWx0ZXIsIGN0eCwgdmFyX2FyZ3MpIHtcbiAgICB2YXIgYXJncyA9IFt0aGlzLmdldFBpeGVscyhjdHgpXTtcbiAgICBmb3IgKHZhciBpPTI7IGk8YXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBhcmdzLnB1c2goYXJndW1lbnRzW2ldKTtcbiAgICB9XG4gICAgcmV0dXJuIGZpbHRlci5hcHBseShudWxsLCBhcmdzKTtcbiAgfTtcblxuICBGaWx0ZXJzLmNyZWF0ZUltYWdlRGF0YSA9IGZ1bmN0aW9uKHcsaCkge1xuICAgIHJldHVybiBjdHguY3JlYXRlSW1hZ2VEYXRhKHcsaCk7XG4gIH07XG5cbiAgRmlsdGVycy5jb252b2x1dGUgPSBmdW5jdGlvbihwaXhlbHMsIHdlaWdodHMsIG9wYXF1ZSkge1xuICAgIHZhciBzaWRlID0gTWF0aC5yb3VuZChNYXRoLnNxcnQod2VpZ2h0cy5sZW5ndGgpKTtcbiAgICB2YXIgaGFsZlNpZGUgPSBNYXRoLmZsb29yKHNpZGUvMik7XG4gICAgdmFyIHNyYyA9IHBpeGVscy5kYXRhO1xuICAgIHZhciBzdyA9IHBpeGVscy53aWR0aDtcbiAgICB2YXIgc2ggPSBwaXhlbHMuaGVpZ2h0O1xuICAgIC8vIHBhZCBvdXRwdXQgYnkgdGhlIGNvbnZvbHV0aW9uIG1hdHJpeFxuICAgIHZhciB3ID0gc3c7XG4gICAgdmFyIGggPSBzaDtcbiAgICB2YXIgeCwgeSwgc3gsIHN5LCBjeCwgY3ksIHNjeSwgc2N4LCBkc3RPZmYsIHNyY09mZiwgd3QsIHIsIGcsIGIsIGE7XG4gICAgdmFyIG91dHB1dCA9IEZpbHRlcnMuY3JlYXRlSW1hZ2VEYXRhKHdpZHRoLCBoZWlnaHQpO1xuICAgIHZhciBkc3QgPSBvdXRwdXQuZGF0YTtcbiAgICAvLyBnbyB0aHJvdWdoIHRoZSBkZXN0aW5hdGlvbiBpbWFnZSBwaXhlbHNcbiAgICBmb3IgKHk9MDsgeTxoOyB5KyspIHtcbiAgICAgIGZvciAoeD0wOyB4PHc7IHgrKykge1xuICAgICAgICBzeSA9IHk7XG4gICAgICAgIHN4ID0geDtcbiAgICAgICAgZHN0T2ZmID0gKHkqdyt4KSo0O1xuICAgICAgICAvLyBjYWxjdWxhdGUgdGhlIHdlaWdoZWQgc3VtIG9mIHRoZSBzb3VyY2UgaW1hZ2UgcGl4ZWxzIHRoYXRcbiAgICAgICAgLy8gZmFsbCB1bmRlciB0aGUgY29udm9sdXRpb24gbWF0cml4XG4gICAgICAgIHI9MCwgZz0wLCBiPTAsIGE9MDtcbiAgICAgICAgZm9yIChjeT0wOyBjeTxzaWRlOyBjeSsrKSB7XG4gICAgICAgICAgZm9yIChjeD0wOyBjeDxzaWRlOyBjeCsrKSB7XG4gICAgICAgICAgICBzY3kgPSBzeSArIGN5IC0gaGFsZlNpZGU7XG4gICAgICAgICAgICBzY3ggPSBzeCArIGN4IC0gaGFsZlNpZGU7XG4gICAgICAgICAgICBpZiAoc2N5ID49IDAgJiYgc2N5IDwgc2ggJiYgc2N4ID49IDAgJiYgc2N4IDwgc3cpIHtcbiAgICAgICAgICAgICAgc3JjT2ZmID0gKHNjeSpzdytzY3gpKjQ7XG4gICAgICAgICAgICAgIHd0ID0gd2VpZ2h0c1tjeSpzaWRlK2N4XTtcbiAgICAgICAgICAgICAgciArPSBzcmNbc3JjT2ZmXSAqIHd0O1xuICAgICAgICAgICAgICBnICs9IHNyY1tzcmNPZmYrMV0gKiB3dDtcbiAgICAgICAgICAgICAgYiArPSBzcmNbc3JjT2ZmKzJdICogd3Q7XG4gICAgICAgICAgICAgIGEgKz0gc3JjW3NyY09mZiszXSAqIHd0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBkc3RbZHN0T2ZmXSA9IHI7XG4gICAgICAgIGRzdFtkc3RPZmYrMV0gPSBnO1xuICAgICAgICBkc3RbZHN0T2ZmKzJdID0gYjtcbiAgICAgICAgZHN0W2RzdE9mZiszXSA9IGE7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvdXRwdXQ7XG4gIH07XG5cbiAgdmFyIGZpbHRlciA9IGZ1bmN0aW9uIGZpbHRlcigpIHtcbiAgICB2YXIgcmVzdWx0ID0gRmlsdGVycy5maWx0ZXJJbWFnZShGaWx0ZXJzLmNvbnZvbHV0ZSwgY3R4LFxuICAgIFsgMS85LCAxLzksIDEvOSxcbiAgICAgIDEvOSwgMS85LCAxLzksXG4gICAgICAxLzksIDEvOSwgMS85IF1cbiAgICApO1xuXG4gICAgY3R4LnB1dEltYWdlRGF0YShyZXN1bHQsIDAsIDApO1xuICB9O1xuXG4gIHJldHVybiB7XG4gICAgZmlsdGVyOiBmaWx0ZXJcbiAgfTtcbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcbi8qIGdsb2JhbCByZXF1aXJlLCBkZWZpbmUsIG1vZHVsZSAqL1xuXG52YXIgZXZlbnREcm9wcyA9IHJlcXVpcmUoJy4vZXZlbnREcm9wcycpO1xuXG5pZiAodHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQpIHtcbiAgZGVmaW5lKCdkMy5jaGFydC5ldmVudERyb3BzJywgW1wiZDNcIl0sIGZ1bmN0aW9uIChkMykge1xuICAgIGQzLmNoYXJ0ID0gZDMuY2hhcnQgfHwge307XG4gICAgZDMuY2hhcnQuZXZlbnREcm9wcyA9IGV2ZW50RHJvcHMoZDMsIGRvY3VtZW50KTtcbiAgfSk7XG59IGVsc2UgaWYgKHdpbmRvdykge1xuICB3aW5kb3cuZDMuY2hhcnQgPSB3aW5kb3cuZDMuY2hhcnQgfHwge307XG4gIHdpbmRvdy5kMy5jaGFydC5ldmVudERyb3BzID0gZXZlbnREcm9wcyh3aW5kb3cuZDMsIGRvY3VtZW50KTtcbn0gZWxzZSB7XG4gIG1vZHVsZS5leHBvcnRzID0gZXZlbnREcm9wcztcbn1cbiIsIlwidXNlIHN0cmljdFwiO1xuLyogZ2xvYmFsIHJlcXVpcmUsIG1vZHVsZSAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjb250ZXh0LCBjb25maWcsIGZpbHRlckRhdGEsIHdpZHRoLCBoZWlnaHQpIHtcblxuICBmdW5jdGlvbiBoZXhUb1JnYihoZXgsIGFscGhhKSB7XG4gICAgdmFyIHJlc3VsdCA9IC9eIz8oW2EtZlxcZF17Mn0pKFthLWZcXGRdezJ9KShbYS1mXFxkXXsyfSkkL2kuZXhlYyhoZXgpO1xuICAgIHZhciB0b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICghdGhpcy5hbHBoYSkge1xuICAgICAgICByZXR1cm4gXCJyZ2IoXCIgKyB0aGlzLnIgKyBcIiwgXCIgKyB0aGlzLmcgKyBcIiwgXCIgKyB0aGlzLmIgKyBcIilcIjtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLmFscGhhID4gMSkge1xuICAgICAgICB0aGlzLmFscGhhID0gMTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5hbHBoYSA8IDApIHtcbiAgICAgICAgdGhpcy5hbHBoYSA9IDA7XG4gICAgICB9XG4gICAgICByZXR1cm4gXCJyZ2JhKFwiICsgdGhpcy5yICsgXCIsIFwiICsgdGhpcy5nICsgXCIsIFwiICsgdGhpcy5iICsgXCIsIFwiICsgdGhpcy5hbHBoYSArIFwiKVwiO1xuICAgIH07XG4gICAgaWYgKCFhbHBoYSkge1xuICAgICAgcmV0dXJuIHJlc3VsdCA/IHtcbiAgICAgICAgcjogcGFyc2VJbnQocmVzdWx0WzFdLCAxNiksXG4gICAgICAgIGc6IHBhcnNlSW50KHJlc3VsdFsyXSwgMTYpLFxuICAgICAgICBiOiBwYXJzZUludChyZXN1bHRbM10sIDE2KSxcbiAgICAgICAgdG9TdHJpbmc6IHRvU3RyaW5nXG4gICAgICB9IDogbnVsbDtcbiAgICB9XG4gICAgaWYgKGFscGhhID4gMSkge1xuICAgICAgYWxwaGEgPSAxO1xuICAgIH0gZWxzZSBpZiAoYWxwaGEgPCAwKSB7XG4gICAgICBhbHBoYSA9IDA7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQgPyB7XG4gICAgICByOiBwYXJzZUludChyZXN1bHRbMV0sIDE2KSxcbiAgICAgIGc6IHBhcnNlSW50KHJlc3VsdFsyXSwgMTYpLFxuICAgICAgYjogcGFyc2VJbnQocmVzdWx0WzNdLCAxNiksXG4gICAgICBhbHBoYTogYWxwaGEsXG4gICAgICB0b1N0cmluZzogdG9TdHJpbmdcbiAgICB9IDogbnVsbDtcbiAgfVxuXG4gIHZhciBkcmF3Q3VzdG9tID0gZnVuY3Rpb24gZHJhd0N1c3RvbSAoZGF0YSkge1xuICAgIHZhciBkYXRlcyA9IGZpbHRlckRhdGEoZGF0YS5kYXRlcywgY29uZmlnLnhTY2FsZSk7XG4gICAgdmFyIHkgPSAwO1xuICAgIGlmICh0eXBlb2YgY29uZmlnLnlTY2FsZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgeSA9IGNvbmZpZy55U2NhbGUoZGF0YS5uYW1lKSArIDI1O1xuICAgIH1lbHNle1xuICAgICAgeSA9IGNvbmZpZy55U2NhbGUgKyAyNTtcbiAgICB9XG4gICAgdmFyIGNvbG9yID0gJ2JsYWNrJztcbiAgICBpZiAoY29uZmlnLmV2ZW50TGluZUNvbG9yKSB7XG4gICAgICBpZiAodHlwZW9mIGNvbmZpZy5ldmVudExpbmVDb2xvciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBjb2xvciA9IGNvbmZpZy5ldmVudExpbmVDb2xvcihkYXRhLCBkYXRhLm5hbWUpO1xuICAgICAgfWVsc2V7XG4gICAgICAgIGNvbG9yID0gY29uZmlnLmV2ZW50TGluZUNvbG9yO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBkYXRlVGFiID0gZGF0ZXMuc29ydChmdW5jdGlvbihhLCBiKSB7XG4gICAgICByZXR1cm4gYSAtIGI7XG4gICAgfSk7XG5cbiAgICB2YXIgY29sb3JzID0gaGV4VG9SZ2IoY29sb3IsIDEpO1xuXG4gICAgaWYgKGNvbnRleHQpIHtcbiAgICAgIGRyYXdMaW5lKGRhdGVUYWIsIHksIGNvbG9ycywgY29udGV4dCk7XG4gICAgfVxuICB9O1xuXG4gIGZ1bmN0aW9uIGRyYXdMaW5lKGRhdGVzLCBjb29yWSwgY29sb3JzLCBjb250ZXh0KSB7XG4gICAgdmFyIHBvaW50cyA9IGRhdGVzLm1hcChmdW5jdGlvbihkYXRlKSB7XG4gICAgICByZXR1cm4geyB4OiBjb25maWcueFNjYWxlKGRhdGUpLCB5OiBjb29yWSwgc2l6ZTogMTUgfTtcbiAgICB9KTtcblxuICAgIGZ1bmN0aW9uIHVwZGF0ZSgpIHtcbiAgICAgIHZhciBzdGFydCA9IChuZXcgRGF0ZSgpKS5nZXRUaW1lKCk7XG4gICAgICB2YXIgbGVuID0gcG9pbnRzLmxlbmd0aDtcbiAgICAgIHdoaWxlIChsZW4tLSkge1xuICAgICAgICB2YXIgcG9pbnQgPSBwb2ludHNbbGVuXTtcblxuICAgICAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgICAgICB2YXIgZ3JhZCA9IGNvbnRleHQuY3JlYXRlUmFkaWFsR3JhZGllbnQocG9pbnQueCwgcG9pbnQueSwgMSwgcG9pbnQueCwgcG9pbnQueSwgcG9pbnQuc2l6ZSk7XG4gICAgICAgIGlmIChjb2xvcnMpIHtcbiAgICAgICAgICBncmFkLmFkZENvbG9yU3RvcCgwLCAncmdiYSgnICsgY29sb3JzLnIgKycsJyArIGNvbG9ycy5nICsgJywnICsgY29sb3JzLmIgKyAnLDEpJyk7XG4gICAgICAgICAgZ3JhZC5hZGRDb2xvclN0b3AoMSwgJ3JnYmEoJyArIGNvbG9ycy5yICsnLCcgKyBjb2xvcnMuZyArICcsJyArIGNvbG9ycy5iICsgJywwKScpO1xuICAgICAgICAgIGNvbnRleHQuZmlsbFN0eWxlID0gZ3JhZDtcbiAgICAgICAgfVxuICAgICAgICBjb250ZXh0LmFyYyhwb2ludC54LCBwb2ludC55LCBwb2ludC5zaXplLCAwLCBNYXRoLlBJKjIpO1xuICAgICAgICBjb250ZXh0LmZpbGwoKTtcbiAgICAgIH1cbiAgICAgIC8vY29uc29sZS5sb2coKG5ldyBEYXRlKCkpLmdldFRpbWUoKS1zdGFydCwgJ21zIGZvciBkcmF3Jyk7XG4gICAgfVxuXG4gICAgdXBkYXRlKCk7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGRyYXdDdXN0b206IGRyYXdDdXN0b21cbiAgfTtcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNvbmZpZ3VyYWJsZSh0YXJnZXRGdW5jdGlvbiwgY29uZmlnLCBsaXN0ZW5lcnMpIHtcbiAgbGlzdGVuZXJzID0gbGlzdGVuZXJzIHx8IHt9O1xuICBmb3IgKHZhciBpdGVtIGluIGNvbmZpZykge1xuICAgIChmdW5jdGlvbihpdGVtKSB7XG4gICAgICB0YXJnZXRGdW5jdGlvbltpdGVtXSA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIGNvbmZpZ1tpdGVtXTtcbiAgICAgICAgY29uZmlnW2l0ZW1dID0gdmFsdWU7XG4gICAgICAgIGlmIChsaXN0ZW5lcnMuaGFzT3duUHJvcGVydHkoaXRlbSkpIHtcbiAgICAgICAgICBsaXN0ZW5lcnNbaXRlbV0odmFsdWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRhcmdldEZ1bmN0aW9uO1xuICAgICAgfTtcbiAgICB9KShpdGVtKTsgLy8gZm9yIGRvZXNuJ3QgY3JlYXRlIGEgY2xvc3VyZSwgZm9yY2luZyBpdFxuICB9XG59O1xuIiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGQzLCBjb25maWcsIHhTY2FsZSwgZ3JhcGgsIGdyYXBoSGVpZ2h0LCB3aGVyZSkge1xuICB2YXIgeEF4aXMgPSB7fTtcbiAgdmFyIHhBeGlzRWxzID0ge307XG5cbiAgdmFyIHRpY2tGb3JtYXREYXRhID0gW107XG5cbiAgY29uZmlnLnRpY2tGb3JtYXQuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSkge1xuICAgIHZhciB0aWNrID0gaXRlbS5zbGljZSgwKTtcbiAgICB0aWNrRm9ybWF0RGF0YS5wdXNoKHRpY2spO1xuICB9KTtcblxuICB2YXIgdGlja0Zvcm1hdCA9IGNvbmZpZy5sb2NhbGUgPyBjb25maWcubG9jYWxlLnRpbWVGb3JtYXQubXVsdGkodGlja0Zvcm1hdERhdGEpIDogZDMudGltZS5mb3JtYXQubXVsdGkodGlja0Zvcm1hdERhdGEpO1xuICB4QXhpc1t3aGVyZV0gPSBkMy5zdmcuYXhpcygpXG4gICAgLnNjYWxlKHhTY2FsZSlcbiAgICAub3JpZW50KHdoZXJlKVxuICAgIC50aWNrRm9ybWF0KHRpY2tGb3JtYXQpXG4gIDtcblxuICBpZiAodHlwZW9mIGNvbmZpZy5heGlzRm9ybWF0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgY29uZmlnLmF4aXNGb3JtYXQoeEF4aXMpO1xuICB9XG5cbiAgdmFyIHkgPSAod2hlcmUgPT0gJ2JvdHRvbScgPyBwYXJzZUludChncmFwaEhlaWdodCkgOiAwKSArIGNvbmZpZy5tYXJnaW4udG9wIC0gNDA7XG5cbiAgeEF4aXNFbHNbd2hlcmVdID0gZ3JhcGhcbiAgICAuYXBwZW5kKCdnJylcbiAgICAuY2xhc3NlZCgneC1heGlzJywgdHJ1ZSlcbiAgICAuY2xhc3NlZCh3aGVyZSwgdHJ1ZSlcbiAgICAuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgnICsgY29uZmlnLm1hcmdpbi5sZWZ0ICsgJywgJyArIHkgKyAnKScpXG4gICAgLmNhbGwoeEF4aXNbd2hlcmVdKVxuICA7XG5cbiAgdmFyIGRyYXdYQXhpcyA9IGZ1bmN0aW9uIGRyYXdYQXhpcygpIHtcbiAgICB4QXhpc0Vsc1t3aGVyZV1cbiAgICAgIC5jYWxsKHhBeGlzW3doZXJlXSlcbiAgICA7XG4gIH07XG5cbiAgcmV0dXJuIHtcbiAgICBkcmF3WEF4aXM6IGRyYXdYQXhpc1xuICB9O1xufTtcbiJdfQ==
