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

          lines.call(eventLine({ xScale: xScale, yScale: yScale, eventLineColor: config.eventLineColor, width: graphWidth, height: graphHeight }));

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
      metabalize();
      //console.log((new Date()).getTime()-start, 'ms for draw');
    }

    function metabalize() {
      var threshold = 180;
      var start = (new Date()).getTime();
      var imageData = context.getImageData(0,0,width,height);
      //var imageData = context.getImageData(0,0,config.width,config.height);
      var pix = imageData.data;

      for (var i = 0, n = pix.length; i < n; i += 4) {
        pix[i + 3] = pix[i+3] < threshold ? 0 : 255;
      }
      context.putImageData(imageData, 0, 0);
      //console.log((new Date()).getTime()-start, 'ms for threshold');
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

},{}]},{},[6]);
