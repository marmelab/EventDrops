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

          lines.call(eventLine({ xScale: xScale, yScale: yScale, eventLineColor: config.eventLineColor, eventColor: config.eventColor }));

          // Applying the lining filter to the canvas
          //FilterFactory.filter();
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
      /*var threshold = 180;
      var start = (new Date()).getTime();
      var imageData = context.getImageData(0,0,config.width,config.height);
      var pix = imageData.data;

      for (var i = 0, n = pix.length; i < n; i += 4) {
        pix[i + 3] = pix[i+3] < threshold ? 0 : 255;
      }
      context.putImageData(imageData, 0, 0);*/
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

},{}]},{},[6])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwibGliL2RlbGltaXRlci5qcyIsImxpYi9ldmVudERyb3BzLmpzIiwibGliL2V2ZW50TGluZS5qcyIsImxpYi9maWx0ZXJEYXRhLmpzIiwibGliL2ZpbHRlckxpbmluZy5qcyIsImxpYi9tYWluLmpzIiwibGliL21ldGFiYWxpemluZ1Rvb2xzLmpzIiwibGliL3V0aWwvY29uZmlndXJhYmxlLmpzIiwibGliL3hBeGlzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcInVzZSBzdHJpY3RcIjtcbi8qIGdsb2JhbCByZXF1aXJlLCBtb2R1bGUsIGQzICovXG5cbnZhciBjb25maWd1cmFibGUgPSByZXF1aXJlKCcuL3V0aWwvY29uZmlndXJhYmxlJyk7XG5cbnZhciBkZWZhdWx0Q29uZmlnID0ge1xuICB4U2NhbGU6IG51bGwsXG4gIGRhdGVGb3JtYXQ6IG51bGxcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGQzKSB7XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIChjb25maWcpIHtcblxuICAgIGNvbmZpZyA9IGNvbmZpZyB8fCB7fTtcbiAgICBmb3IgKHZhciBrZXkgaW4gZGVmYXVsdENvbmZpZykge1xuICAgICAgY29uZmlnW2tleV0gPSBjb25maWdba2V5XSB8fCBkZWZhdWx0Q29uZmlnW2tleV07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZGVsaW1pdGVyKHNlbGVjdGlvbikge1xuICAgICAgc2VsZWN0aW9uLmVhY2goZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgZDMuc2VsZWN0KHRoaXMpLnNlbGVjdEFsbCgndGV4dCcpLnJlbW92ZSgpO1xuXG4gICAgICAgIHZhciBsaW1pdHMgPSBjb25maWcueFNjYWxlLmRvbWFpbigpO1xuXG4gICAgICAgIGQzLnNlbGVjdCh0aGlzKS5hcHBlbmQoJ3RleHQnKVxuICAgICAgICAgIC50ZXh0KGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgcmV0dXJuIGNvbmZpZy5kYXRlRm9ybWF0KGxpbWl0c1swXSk7XG4gICAgICAgICAgfSlcbiAgICAgICAgICAuY2xhc3NlZCgnc3RhcnQnLCB0cnVlKVxuICAgICAgICA7XG5cbiAgICAgICAgZDMuc2VsZWN0KHRoaXMpLmFwcGVuZCgndGV4dCcpXG4gICAgICAgICAgLnRleHQoZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICByZXR1cm4gY29uZmlnLmRhdGVGb3JtYXQobGltaXRzWzFdKTtcbiAgICAgICAgICB9KVxuICAgICAgICAgIC5hdHRyKCd0ZXh0LWFuY2hvcicsICdlbmQnKVxuICAgICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCcgKyBjb25maWcueFNjYWxlLnJhbmdlKClbMV0gKyAnKScpXG4gICAgICAgICAgLmNsYXNzZWQoJ2VuZCcsIHRydWUpXG4gICAgICAgIDtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGNvbmZpZ3VyYWJsZShkZWxpbWl0ZXIsIGNvbmZpZyk7XG5cbiAgICByZXR1cm4gZGVsaW1pdGVyO1xuICB9O1xufTtcbiIsIlwidXNlIHN0cmljdFwiO1xuLyogZ2xvYmFsIHJlcXVpcmUsIG1vZHVsZSAqL1xuXG52YXIgY29uZmlndXJhYmxlID0gcmVxdWlyZSgnLi91dGlsL2NvbmZpZ3VyYWJsZScpO1xudmFyIHhBeGlzRmFjdG9yeSA9IHJlcXVpcmUoJy4veEF4aXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZDMsIGRvY3VtZW50KSB7XG4gIHZhciBkZWxpbWl0ZXIgPSByZXF1aXJlKCcuL2RlbGltaXRlcicpKGQzKTtcbiAgdmFyIGZpbHRlckRhdGEgPSByZXF1aXJlKCcuL2ZpbHRlckRhdGEnKTtcblxuICB2YXIgZGVmYXVsdENvbmZpZyA9IHtcblx0XHRzdGFydDogbmV3IERhdGUoMCksXG5cdFx0ZW5kOiBuZXcgRGF0ZSgpLFxuXHRcdG1pblNjYWxlOiAwLFxuXHRcdG1heFNjYWxlOiBJbmZpbml0eSxcblx0XHR3aWR0aDogMTAwMCxcblx0XHRtYXJnaW46IHtcblx0XHQgIHRvcDogNjAsXG5cdFx0ICBsZWZ0OiAyMDAsXG5cdFx0ICBib3R0b206IDQwLFxuXHRcdCAgcmlnaHQ6IDUwXG5cdFx0fSxcblx0XHRsb2NhbGU6IG51bGwsXG5cdFx0YXhpc0Zvcm1hdDogbnVsbCxcblx0XHR0aWNrRm9ybWF0OiBbXG5cdFx0XHRbXCIuJUxcIiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gZC5nZXRNaWxsaXNlY29uZHMoKTsgfV0sXG5cdFx0XHRbXCI6JVNcIiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gZC5nZXRTZWNvbmRzKCk7IH1dLFxuXHRcdFx0W1wiJUk6JU1cIiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gZC5nZXRNaW51dGVzKCk7IH1dLFxuXHRcdFx0W1wiJUkgJXBcIiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gZC5nZXRIb3VycygpOyB9XSxcblx0XHRcdFtcIiVhICVkXCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQuZ2V0RGF5KCkgJiYgZC5nZXREYXRlKCkgIT0gMTsgfV0sXG5cdFx0XHRbXCIlYiAlZFwiLCBmdW5jdGlvbihkKSB7IHJldHVybiBkLmdldERhdGUoKSAhPSAxOyB9XSxcblx0XHRcdFtcIiVCXCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQuZ2V0TW9udGgoKTsgfV0sXG5cdFx0XHRbXCIlWVwiLCBmdW5jdGlvbigpIHsgcmV0dXJuIHRydWU7IH1dXG5cdFx0XSxcblx0XHRldmVudEhvdmVyOiBudWxsLFxuXHRcdGV2ZW50Wm9vbTogbnVsbCxcblx0XHRldmVudENsaWNrOiBudWxsLFxuXHRcdGhhc0RlbGltaXRlcjogdHJ1ZSxcblx0XHRoYXNUb3BBeGlzOiB0cnVlLFxuXHRcdGhhc0JvdHRvbUF4aXM6IGZ1bmN0aW9uIChkYXRhKSB7XG5cdFx0ICByZXR1cm4gZGF0YS5sZW5ndGggPj0gMTA7XG5cdFx0fSxcblx0XHRldmVudExpbmVDb2xvcjogJ2JsYWNrJyxcblx0XHRldmVudENvbG9yOiBudWxsXG4gIH07XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIGV2ZW50RHJvcHMoY29uZmlnKSB7XG5cdFx0dmFyIHhTY2FsZSA9IGQzLnRpbWUuc2NhbGUoKTtcblx0XHR2YXIgeVNjYWxlID0gZDMuc2NhbGUub3JkaW5hbCgpO1xuXHRcdGNvbmZpZyA9IGNvbmZpZyB8fCB7fTtcblx0XHRmb3IgKHZhciBrZXkgaW4gZGVmYXVsdENvbmZpZykge1xuXHRcdCAgY29uZmlnW2tleV0gPSBjb25maWdba2V5XSB8fCBkZWZhdWx0Q29uZmlnW2tleV07XG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gZXZlbnREcm9wR3JhcGgoc2VsZWN0aW9uKSB7XG5cdFx0ICBzZWxlY3Rpb24uZWFjaChmdW5jdGlvbiAoZGF0YSkge1xuXHRcdFx0XHR2YXIgem9vbSA9IGQzLmJlaGF2aW9yLnpvb20oKS5jZW50ZXIobnVsbCkuc2NhbGVFeHRlbnQoW2NvbmZpZy5taW5TY2FsZSwgY29uZmlnLm1heFNjYWxlXSkub24oXCJ6b29tXCIsIHVwZGF0ZVpvb20pO1xuXHRcdFx0XHR6b29tLm9uKFwiem9vbWVuZFwiLCB6b29tRW5kKTtcblxuICAgICAgICB2YXIgZ3JhcGhXaWR0aCA9IGNvbmZpZy53aWR0aCAtIGNvbmZpZy5tYXJnaW4ucmlnaHQgLSBjb25maWcubWFyZ2luLmxlZnQ7XG4gICAgICAgIHZhciBncmFwaEhlaWdodCA9IGRhdGEubGVuZ3RoICogNDA7XG4gICAgICAgIHZhciBoZWlnaHQgPSBncmFwaEhlaWdodCArIGNvbmZpZy5tYXJnaW4udG9wICsgY29uZmlnLm1hcmdpbi5ib3R0b207XG4gICAgICAgIHZhciB4QXhpc1RvcCwgeEF4aXNCb3R0b207XG5cbiAgICAgICAgdmFyIGJhc2UgPSBkMy5zZWxlY3QodGhpcyk7XG5cblx0XHRcdFx0YmFzZS5zZWxlY3QoJ2NhbnZhcycpLnJlbW92ZSgpO1xuICBcdFx0XHR2YXIgY2FudmFzID0gYmFzZVxuICBcdFx0XHQgIC5hcHBlbmQoJ2NhbnZhcycpXG4gIFx0XHRcdCAgLmF0dHIoJ2lkJywgXCJtb25fY2FudmFzXCIpXG4gIFx0XHRcdCAgLmF0dHIoJ3dpZHRoJywgZ3JhcGhXaWR0aClcbiAgXHRcdFx0ICAuYXR0cignaGVpZ2h0JywgZ3JhcGhIZWlnaHQpO1xuXG4gIFx0XHQgIHZhciBjdHggPSAoY2FudmFzLm5vZGUoKSkuZ2V0Q29udGV4dCgnMmQnKTtcblxuICAgICAgICB2YXIgZXZlbnRMaW5lID0gcmVxdWlyZSgnLi9ldmVudExpbmUnKShkMywgY3R4KTtcbiAgICAgICAgdmFyIEZpbHRlckZhY3RvcnkgPSByZXF1aXJlKCcuL2ZpbHRlckxpbmluZycpKGN0eCwgZ3JhcGhXaWR0aCwgZ3JhcGhIZWlnaHQpO1xuXG4gIFx0XHRcdGJhc2Uuc2VsZWN0KCdzdmcnKS5yZW1vdmUoKTtcblxuICBcdFx0XHR2YXIgc3ZnID0gYmFzZVxuICBcdFx0XHQgIC5hcHBlbmQoJ3N2ZycpXG4gIFx0XHRcdCAgLmF0dHIoJ3dpZHRoJywgY29uZmlnLndpZHRoKVxuICBcdFx0XHQgIC5hdHRyKCdoZWlnaHQnLCBoZWlnaHQpXG4gIFx0XHRcdDtcblxuICBcdFx0XHR2YXIgZ3JhcGggPSBzdmcuYXBwZW5kKCdnJylcbiAgXHRcdFx0ICAuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgwLCAyNSknKTtcblxuICBcdFx0XHR2YXIgeURvbWFpbiA9IFtdO1xuICBcdFx0XHR2YXIgeVJhbmdlID0gW107XG5cbiAgXHRcdFx0ZGF0YS5mb3JFYWNoKGZ1bmN0aW9uIChldmVudCwgaW5kZXgpIHtcbiAgXHRcdFx0ICB5RG9tYWluLnB1c2goZXZlbnQubmFtZSk7XG4gIFx0XHRcdCAgeVJhbmdlLnB1c2goaW5kZXggKiA0MCk7XG4gIFx0XHRcdH0pO1xuXG4gIFx0XHRcdHlTY2FsZS5kb21haW4oeURvbWFpbikucmFuZ2UoeVJhbmdlKTtcblxuICBcdFx0XHR2YXIgeUF4aXNFbCA9IGdyYXBoLmFwcGVuZCgnZycpXG4gIFx0XHRcdCAgLmNsYXNzZWQoJ3ktYXhpcycsIHRydWUpXG4gIFx0XHRcdCAgLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoMCwgNjApJyk7XG5cbiAgXHRcdFx0dmFyIHlUaWNrID0geUF4aXNFbC5hcHBlbmQoJ2cnKS5zZWxlY3RBbGwoJ2cnKS5kYXRhKHlEb21haW4pO1xuXG4gIFx0XHRcdHlUaWNrLmVudGVyKClcbiAgXHRcdFx0ICAuYXBwZW5kKCdnJylcbiAgXHRcdFx0ICAuYXR0cigndHJhbnNmb3JtJywgZnVuY3Rpb24oZCkge1xuICBcdFx0XHRcdHJldHVybiAndHJhbnNsYXRlKDAsICcgKyB5U2NhbGUoZCkgKyAnKSc7XG4gIFx0XHRcdCAgfSlcbiAgXHRcdFx0ICAuYXBwZW5kKCdsaW5lJylcbiAgXHRcdFx0ICAuY2xhc3NlZCgneS10aWNrJywgdHJ1ZSlcbiAgXHRcdFx0ICAuYXR0cigneDEnLCBjb25maWcubWFyZ2luLmxlZnQpXG4gIFx0XHRcdCAgLmF0dHIoJ3gyJywgY29uZmlnLm1hcmdpbi5sZWZ0ICsgZ3JhcGhXaWR0aCk7XG5cblx0XHRcdCAgeVRpY2suZXhpdCgpLnJlbW92ZSgpO1xuXG4gIFx0XHRcdHZhciBjdXJ4LCBjdXJ5O1xuICBcdFx0XHR2YXIgem9vbVJlY3QgPSBzdmdcbiAgXHRcdFx0ICAuYXBwZW5kKCdyZWN0JylcbiAgXHRcdFx0ICAuY2FsbCh6b29tKVxuICBcdFx0XHQgIC5jbGFzc2VkKCd6b29tJywgdHJ1ZSlcbiAgXHRcdFx0ICAuYXR0cignd2lkdGgnLCBncmFwaFdpZHRoKVxuICBcdFx0XHQgIC5hdHRyKCdoZWlnaHQnLCBoZWlnaHQgKVxuICBcdFx0XHQgIC5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCcgKyBjb25maWcubWFyZ2luLmxlZnQgKyAnLCAzNSknKVxuICBcdFx0XHQ7XG5cbiAgXHRcdFx0aWYgKHR5cGVvZiBjb25maWcuZXZlbnRIb3ZlciA9PT0gJ2Z1bmN0aW9uJykge1xuICBcdFx0XHQgIHpvb21SZWN0Lm9uKCdtb3VzZW1vdmUnLCBmdW5jdGlvbihkLCBlKSB7XG4gIFx0XHRcdFx0dmFyIGV2ZW50ID0gZDMuZXZlbnQ7XG4gIFx0XHRcdFx0aWYgKGN1cnggPT0gZXZlbnQuY2xpZW50WCAmJiBjdXJ5ID09IGV2ZW50LmNsaWVudFkpIHJldHVybjtcbiAgXHRcdFx0XHRjdXJ4ID0gZXZlbnQuY2xpZW50WDtcbiAgXHRcdFx0XHRjdXJ5ID0gZXZlbnQuY2xpZW50WTtcbiAgXHRcdFx0XHR6b29tUmVjdC5hdHRyKCdkaXNwbGF5JywgJ25vbmUnKTtcbiAgXHRcdFx0XHR2YXIgZWwgPSBkb2N1bWVudC5lbGVtZW50RnJvbVBvaW50KGQzLmV2ZW50LmNsaWVudFgsIGQzLmV2ZW50LmNsaWVudFkpO1xuICBcdFx0XHRcdHpvb21SZWN0LmF0dHIoJ2Rpc3BsYXknLCAnYmxvY2snKTtcbiAgXHRcdFx0XHRpZiAoZWwudGFnTmFtZSAhPT0gJ2NpcmNsZScpIHJldHVybjtcbiAgXHRcdFx0XHRjb25maWcuZXZlbnRIb3ZlcihlbCk7XG4gIFx0XHRcdCAgfSk7XG4gIFx0XHRcdH1cblxuICBcdFx0XHRpZiAodHlwZW9mIGNvbmZpZy5ldmVudENsaWNrID09PSAnZnVuY3Rpb24nKSB7XG4gIFx0XHRcdCAgem9vbVJlY3Qub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuICBcdFx0XHRcdHpvb21SZWN0LmF0dHIoJ2Rpc3BsYXknLCAnbm9uZScpO1xuICBcdFx0XHRcdHZhciBlbCA9IGRvY3VtZW50LmVsZW1lbnRGcm9tUG9pbnQoZDMuZXZlbnQuY2xpZW50WCwgZDMuZXZlbnQuY2xpZW50WSk7XG4gIFx0XHRcdFx0em9vbVJlY3QuYXR0cignZGlzcGxheScsICdibG9jaycpO1xuICBcdFx0XHRcdGlmIChlbC50YWdOYW1lICE9PSAnY2lyY2xlJykgcmV0dXJuO1xuICBcdFx0XHRcdGNvbmZpZy5ldmVudENsaWNrKGVsKTtcbiAgXHRcdFx0ICB9KTtcbiAgXHRcdFx0fVxuXG4gICAgICAgIHhTY2FsZS5yYW5nZShbMCwgZ3JhcGhXaWR0aF0pLmRvbWFpbihbY29uZmlnLnN0YXJ0LCBjb25maWcuZW5kXSk7XG5cbiAgICAgICAgem9vbS54KHhTY2FsZSk7XG5cbiAgICAgICAgZnVuY3Rpb24gdXBkYXRlWm9vbSgpIHtcbiAgICAgICAgICBpZiAoZDMuZXZlbnQuc291cmNlRXZlbnQgJiYgZDMuZXZlbnQuc291cmNlRXZlbnQudG9TdHJpbmcoKSA9PT0gJ1tvYmplY3QgTW91c2VFdmVudF0nKSB7XG4gICAgICAgICAgICB6b29tLnRyYW5zbGF0ZShbZDMuZXZlbnQudHJhbnNsYXRlWzBdLCAwXSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKGQzLmV2ZW50LnNvdXJjZUV2ZW50ICYmIGQzLmV2ZW50LnNvdXJjZUV2ZW50LnRvU3RyaW5nKCkgPT09ICdbb2JqZWN0IFdoZWVsRXZlbnRdJykge1xuICAgICAgICAgICAgem9vbS5zY2FsZShkMy5ldmVudC5zY2FsZSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJlZHJhdygpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gaW5pdGlhbGl6YXRpb24gb2YgdGhlIGRlbGltaXRlclxuICAgICAgICBzdmcuc2VsZWN0KCcuZGVsaW1pdGVyJykucmVtb3ZlKCk7XG4gICAgICAgIHZhciBkZWxpbWl0ZXJFbCA9IHN2Z1xuICAgICAgICAgIC5hcHBlbmQoJ2cnKVxuICAgICAgICAgIC5jbGFzc2VkKCdkZWxpbWl0ZXInLCB0cnVlKVxuICAgICAgICAgIC5hdHRyKCd3aWR0aCcsIGdyYXBoV2lkdGgpXG4gICAgICAgICAgLmF0dHIoJ2hlaWdodCcsIDEwKVxuICAgICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCcgKyBjb25maWcubWFyZ2luLmxlZnQgKyAnLCAnICsgKGNvbmZpZy5tYXJnaW4udG9wIC0gNDUpICsgJyknKVxuICAgICAgICAgIC5jYWxsKGRlbGltaXRlcih7XG4gICAgICAgICAgICB4U2NhbGU6IHhTY2FsZSxcbiAgICAgICAgICAgIGRhdGVGb3JtYXQ6IGNvbmZpZy5sb2NhbGUgPyBjb25maWcubG9jYWxlLnRpbWVGb3JtYXQoXCIlZCAlQiAlWVwiKSA6IGQzLnRpbWUuZm9ybWF0KFwiJWQgJUIgJVlcIilcbiAgICAgICAgICB9KSlcbiAgICAgICAgO1xuXG4gICAgICAgIGZ1bmN0aW9uIHJlZHJhd0RlbGltaXRlcigpIHtcbiAgICAgICAgICBkZWxpbWl0ZXJFbC5jYWxsKGRlbGltaXRlcih7XG4gICAgICAgICAgICB4U2NhbGU6IHhTY2FsZSxcbiAgICAgICAgICAgIGRhdGVGb3JtYXQ6IGNvbmZpZy5sb2NhbGUgPyBjb25maWcubG9jYWxlLnRpbWVGb3JtYXQoXCIlZCAlQiAlWVwiKSA6IGQzLnRpbWUuZm9ybWF0KFwiJWQgJUIgJVlcIilcbiAgICAgICAgICB9KSk7XG4gICAgICAgIH1cblxuICBcdFx0XHRmdW5jdGlvbiB6b29tRW5kKCkge1xuICBcdFx0XHQgIGlmIChjb25maWcuZXZlbnRab29tKSB7XG4gIFx0XHRcdFx0ICBjb25maWcuZXZlbnRab29tKHhTY2FsZSk7XG4gIFx0XHRcdCAgfVxuICBcdFx0XHQgIGlmIChjb25maWcuaGFzRGVsaW1pdGVyKSB7XG4gIFx0XHRcdFx0ICByZWRyYXdEZWxpbWl0ZXIoKTtcbiAgXHRcdFx0ICB9XG4gIFx0XHRcdH1cblxuICAgICAgICB2YXIgaGFzVG9wQXhpcyA9IHR5cGVvZiBjb25maWcuaGFzVG9wQXhpcyA9PT0gJ2Z1bmN0aW9uJyA/IGNvbmZpZy5oYXNUb3BBeGlzKGRhdGEpIDogY29uZmlnLmhhc1RvcEF4aXM7XG4gICAgICAgIGlmIChoYXNUb3BBeGlzKSB7XG4gICAgICAgICAgeEF4aXNUb3AgPSB4QXhpc0ZhY3RvcnkoZDMsIGNvbmZpZywgeFNjYWxlLCBncmFwaCwgZ3JhcGhIZWlnaHQsICd0b3AnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBoYXNCb3R0b21BeGlzID0gdHlwZW9mIGNvbmZpZy5oYXNCb3R0b21BeGlzID09PSAnZnVuY3Rpb24nID8gY29uZmlnLmhhc0JvdHRvbUF4aXMoZGF0YSkgOiBjb25maWcuaGFzQm90dG9tQXhpcztcbiAgICAgICAgaWYgKGhhc0JvdHRvbUF4aXMpIHtcbiAgICAgICAgICB4QXhpc0JvdHRvbSA9IHhBeGlzRmFjdG9yeShkMywgY29uZmlnLCB4U2NhbGUsIGdyYXBoLCBncmFwaEhlaWdodCwgJ2JvdHRvbScpO1xuICAgICAgICB9XG5cbiAgXHRcdFx0ZnVuY3Rpb24gZHJhd1hBeGlzKHdoZXJlKSB7XG4gIFx0XHRcdCAgLy8gY29weSBjb25maWcudGlja0Zvcm1hdCBiZWNhdXNlIGQzIGZvcm1hdC5tdWx0aSBlZGl0IGl0cyBnaXZlbiB0aWNrRm9ybWF0IGRhdGFcbiAgXHRcdFx0ICB2YXIgdGlja0Zvcm1hdERhdGEgPSBbXTtcblxuICBcdFx0XHQgIGNvbmZpZy50aWNrRm9ybWF0LmZvckVhY2goZnVuY3Rpb24gKGl0ZW0pIHtcbiAgXHRcdFx0XHQgIHZhciB0aWNrID0gaXRlbS5zbGljZSgwKTtcbiAgXHRcdFx0XHQgIHRpY2tGb3JtYXREYXRhLnB1c2godGljayk7XG4gIFx0XHRcdCAgfSk7XG5cbiAgXHRcdFx0ICB2YXIgdGlja0Zvcm1hdCA9IGNvbmZpZy5sb2NhbGUgPyBjb25maWcubG9jYWxlLnRpbWVGb3JtYXQubXVsdGkodGlja0Zvcm1hdERhdGEpIDogZDMudGltZS5mb3JtYXQubXVsdGkodGlja0Zvcm1hdERhdGEpO1xuICBcdFx0XHQgIHZhciB4QXhpcyA9IGQzLnN2Zy5heGlzKClcbiAgXHRcdFx0XHQgIC5zY2FsZSh4U2NhbGUpXG4gIFx0XHRcdFx0ICAub3JpZW50KHdoZXJlKVxuICBcdFx0XHRcdCAgLnRpY2tGb3JtYXQodGlja0Zvcm1hdClcbiAgXHRcdFx0ICA7XG5cbiAgXHRcdFx0ICBpZiAodHlwZW9mIGNvbmZpZy5heGlzRm9ybWF0ID09PSAnZnVuY3Rpb24nKSB7XG4gIFx0XHRcdFx0ICBjb25maWcuYXhpc0Zvcm1hdCh4QXhpcyk7XG4gIFx0XHRcdCAgfVxuXG4gIFx0XHRcdCAgdmFyIHkgPSAod2hlcmUgPT0gJ2JvdHRvbScgPyBwYXJzZUludChncmFwaEhlaWdodCkgOiAwKSArIGNvbmZpZy5tYXJnaW4udG9wIC0gNDA7XG5cbiAgXHRcdFx0ICBncmFwaC5zZWxlY3QoJy54LWF4aXMuJyArIHdoZXJlKS5yZW1vdmUoKTtcbiAgXHRcdFx0ICB2YXIgeEF4aXNFbCA9IGdyYXBoXG4gICAgXHRcdFx0XHQuYXBwZW5kKCdnJylcbiAgICBcdFx0XHRcdC5jbGFzc2VkKCd4LWF4aXMnLCB0cnVlKVxuICAgIFx0XHRcdFx0LmNsYXNzZWQod2hlcmUsIHRydWUpXG4gICAgXHRcdFx0XHQuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgnICsgY29uZmlnLm1hcmdpbi5sZWZ0ICsgJywgJyArIHkgKyAnKScpXG4gICAgXHRcdFx0XHQuY2FsbCh4QXhpcylcbiAgXHRcdFx0ICA7XG4gIFx0XHRcdH1cblxuICBcdFx0XHQvLyBpbml0aWFsaXphdGlvbiBvZiB0aGUgZ3JhcGggYm9keVxuICAgICAgICB6b29tLnNpemUoW2NvbmZpZy53aWR0aCwgaGVpZ2h0XSk7XG5cbiAgICAgICAgZ3JhcGguc2VsZWN0KCcuZ3JhcGgtYm9keScpLnJlbW92ZSgpO1xuICAgICAgICB2YXIgZ3JhcGhCb2R5ID0gZ3JhcGhcbiAgICAgICAgICAuYXBwZW5kKCdnJylcbiAgICAgICAgICAuY2xhc3NlZCgnZ3JhcGgtYm9keScsIHRydWUpXG4gICAgICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoJyArIGNvbmZpZy5tYXJnaW4ubGVmdCArICcsICcgKyAoY29uZmlnLm1hcmdpbi50b3AgLSAxNSkgKyAnKScpO1xuXG4gICAgICAgIHZhciBsaW5lcyA9IGdyYXBoQm9keS5zZWxlY3RBbGwoJ2cnKS5kYXRhKGRhdGEpO1xuXG4gICAgICAgIGxpbmVzLmVudGVyKClcbiAgICAgICAgICAuYXBwZW5kKCdnJylcbiAgICAgICAgICAuY2xhc3NlZCgnbGluZScsIHRydWUpXG4gICAgICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsIGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICAgIHJldHVybiAndHJhbnNsYXRlKDAsJyArIHlTY2FsZShkLm5hbWUpICsgJyknO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLnN0eWxlKCdmaWxsJywgY29uZmlnLmV2ZW50TGluZUNvbG9yKVxuICAgICAgICAgIC5jYWxsKGV2ZW50TGluZSh7IHhTY2FsZTogeFNjYWxlLCBldmVudENvbG9yOiBjb25maWcuZXZlbnRDb2xvciB9KSlcbiAgICAgICAgO1xuXG4gICAgICAgIGxpbmVzLmV4aXQoKS5yZW1vdmUoKTtcblxuICAgICAgICBmdW5jdGlvbiByZWRyYXcoKSB7XG4gICAgICAgICAgLy8gU3RvcmUgdGhlIGN1cnJlbnQgdHJhbnNmb3JtYXRpb24gbWF0cml4XG4gICAgICAgICAgY3R4LnNhdmUoKTtcbiAgICAgICAgICAvLyBTZXQgYmFjayB0byB0aGUgb3JpZ2luYWwgY2FudmFzXG4gICAgICAgICAgY3R4LnNldFRyYW5zZm9ybSgxLCAwLCAwLCAxLCAwLCAwKTtcbiAgICAgICAgICAvLyBDbGVhciB0aGUgY2FudmFzXG4gICAgICAgICAgY3R4LmNsZWFyUmVjdCgwLCAwLCBncmFwaFdpZHRoLCBncmFwaEhlaWdodCk7XG4gICAgICAgICAgLy8gUmVzdG9yZSB0aGUgZm9ybWVyIGNvb3JkaW5hdGVzXG4gICAgICAgICAgY3R4LnJlc3RvcmUoKTtcblxuICAgICAgICAgIHZhciBoYXNUb3BBeGlzID0gdHlwZW9mIGNvbmZpZy5oYXNUb3BBeGlzID09PSAnZnVuY3Rpb24nID8gY29uZmlnLmhhc1RvcEF4aXMoZGF0YSkgOiBjb25maWcuaGFzVG9wQXhpcztcbiAgICAgICAgICBpZiAoaGFzVG9wQXhpcykge1xuICAgICAgICAgICAgeEF4aXNUb3AuZHJhd1hBeGlzKCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdmFyIGhhc0JvdHRvbUF4aXMgPSB0eXBlb2YgY29uZmlnLmhhc0JvdHRvbUF4aXMgPT09ICdmdW5jdGlvbicgPyBjb25maWcuaGFzQm90dG9tQXhpcyhkYXRhKSA6IGNvbmZpZy5oYXNCb3R0b21BeGlzO1xuICAgICAgICAgIGlmIChoYXNCb3R0b21BeGlzKSB7XG4gICAgICAgICAgICB4QXhpc0JvdHRvbS5kcmF3WEF4aXMoKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBsaW5lcy5jYWxsKGV2ZW50TGluZSh7IHhTY2FsZTogeFNjYWxlLCB5U2NhbGU6IHlTY2FsZSwgZXZlbnRMaW5lQ29sb3I6IGNvbmZpZy5ldmVudExpbmVDb2xvciwgZXZlbnRDb2xvcjogY29uZmlnLmV2ZW50Q29sb3IgfSkpO1xuXG4gICAgICAgICAgLy8gQXBwbHlpbmcgdGhlIGxpbmluZyBmaWx0ZXIgdG8gdGhlIGNhbnZhc1xuICAgICAgICAgIC8vRmlsdGVyRmFjdG9yeS5maWx0ZXIoKTtcbiAgXHRcdFx0fVxuXG4gIFx0XHRcdHJlZHJhdygpO1xuICBcdFx0XHRpZiAoY29uZmlnLmhhc0RlbGltaXRlcikge1xuICBcdFx0XHQgIHJlZHJhd0RlbGltaXRlcigpO1xuICBcdFx0XHR9XG4gIFx0XHRcdGlmIChjb25maWcuZXZlbnRab29tKSB7XG4gIFx0XHRcdCAgY29uZmlnLmV2ZW50Wm9vbSh4U2NhbGUpO1xuICBcdFx0XHR9XG5cdFx0ICB9KTtcblx0XHR9XG5cdFx0Y29uZmlndXJhYmxlKGV2ZW50RHJvcEdyYXBoLCBjb25maWcpO1xuXG5cdFx0cmV0dXJuIGV2ZW50RHJvcEdyYXBoO1xuICB9O1xufTtcbiIsIlwidXNlIHN0cmljdFwiO1xuLyogZ2xvYmFsIHJlcXVpcmUsIG1vZHVsZSwgZDMgKi9cblxudmFyIGNvbmZpZ3VyYWJsZSA9IHJlcXVpcmUoJy4vdXRpbC9jb25maWd1cmFibGUnKTtcbnZhciBmaWx0ZXJEYXRhID0gcmVxdWlyZSgnLi9maWx0ZXJEYXRhJyk7XG5cbnZhciBkZWZhdWx0Q29uZmlnID0ge1xuICB4U2NhbGU6IG51bGwsXG4gIHlTY2FsZTogbnVsbFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZDMsIGNvbnRleHQpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChjb25maWcpIHtcblxuICAgIGNvbmZpZyA9IGNvbmZpZyB8fCB7XG4gICAgICB4U2NhbGU6IG51bGwsXG4gICAgICB5U2NhbGU6IG51bGwsXG4gICAgICBldmVudExpbmVDb2xvcjogJ2JsYWNrJyxcbiAgICAgIHdpZHRoOiAwLFxuICAgICAgaGVpZ2h0OiAwXG4gICAgfTtcbiAgICBmb3IgKHZhciBrZXkgaW4gZGVmYXVsdENvbmZpZykge1xuICAgICAgY29uZmlnW2tleV0gPSBjb25maWdba2V5XSB8fCBkZWZhdWx0Q29uZmlnW2tleV07XG4gICAgfVxuXG4gICAgdmFyIGV2ZW50TGluZSA9IGZ1bmN0aW9uIGV2ZW50TGluZShzZWxlY3Rpb24pIHtcbiAgICAgIHNlbGVjdGlvbi5lYWNoKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgIGQzLnNlbGVjdCh0aGlzKS5zZWxlY3RBbGwoJ3RleHQnKS5yZW1vdmUoKTtcblxuICAgICAgICBkMy5zZWxlY3QodGhpcykuYXBwZW5kKCd0ZXh0JylcbiAgICAgICAgICAudGV4dChmdW5jdGlvbihkKSB7XG4gICAgICAgICAgICB2YXIgY291bnQgPSBmaWx0ZXJEYXRhKGQuZGF0ZXMsIGNvbmZpZy54U2NhbGUpLmxlbmd0aDtcbiAgICAgICAgICAgIHJldHVybiBkLm5hbWUgKyAoY291bnQgPiAwID8gJyAoJyArIGNvdW50ICsgJyknIDogJycpO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLmF0dHIoJ3RleHQtYW5jaG9yJywgJ2VuZCcpXG4gICAgICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoLTIwKScpXG4gICAgICAgICAgLnN0eWxlKCdmaWxsJywgJ2JsYWNrJylcbiAgICAgICAgO1xuXG4gICAgICAgIHZhciBkYXRhQ29udGFpbmVyID0gZDMuc2VsZWN0KFwiYm9keVwiKS5hcHBlbmQoJ2N1c3RvbScpO1xuXG4gICAgICAgIHZhciBNZXRhYmFsbEZhY3RvcnkgPSByZXF1aXJlKCcuL21ldGFiYWxpemluZ1Rvb2xzJykoY29udGV4dCwgY29uZmlnLCBmaWx0ZXJEYXRhKTtcblxuICAgICAgICBNZXRhYmFsbEZhY3RvcnkuZHJhd0N1c3RvbShkYXRhKTtcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICBjb25maWd1cmFibGUoZXZlbnRMaW5lLCBjb25maWcpO1xuXG4gICAgcmV0dXJuIGV2ZW50TGluZTtcbiAgfTtcbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcbi8qIGdsb2JhbCBtb2R1bGUgKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBmaWx0ZXJEYXRlKGRhdGEsIHNjYWxlKSB7XG4gIGRhdGEgPSBkYXRhIHx8IFtdO1xuICB2YXIgYm91bmRhcnkgPSBzY2FsZS5yYW5nZSgpO1xuICB2YXIgbWluID0gYm91bmRhcnlbMF07XG4gIHZhciBtYXggPSBib3VuZGFyeVsxXTtcblxuICByZXR1cm4gZGF0YS5maWx0ZXIoZnVuY3Rpb24gKGRhdHVtKSB7XG4gICAgdmFyIHZhbHVlID0gc2NhbGUoZGF0dW0pO1xuICAgIHJldHVybiAhKHZhbHVlIDwgbWluIHx8IHZhbHVlID4gbWF4KTtcbiAgfSk7XG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vKiBnbG9iYWwgcmVxdWlyZSwgbW9kdWxlICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGN0eCwgd2lkdGgsIGhlaWdodCkge1xuXG4gIHZhciBGaWx0ZXJzID0ge307XG4gIEZpbHRlcnMuZ2V0UGl4ZWxzID0gZnVuY3Rpb24oY3R4KSB7XG4gICAgcmV0dXJuIGN0eC5nZXRJbWFnZURhdGEoMCwwLHdpZHRoLGhlaWdodCk7XG4gIH07XG5cbiAgRmlsdGVycy5maWx0ZXJJbWFnZSA9IGZ1bmN0aW9uKGZpbHRlciwgY3R4LCB2YXJfYXJncykge1xuICAgIHZhciBhcmdzID0gW3RoaXMuZ2V0UGl4ZWxzKGN0eCldO1xuICAgIGZvciAodmFyIGk9MjsgaTxhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGFyZ3MucHVzaChhcmd1bWVudHNbaV0pO1xuICAgIH1cbiAgICByZXR1cm4gZmlsdGVyLmFwcGx5KG51bGwsIGFyZ3MpO1xuICB9O1xuXG4gIEZpbHRlcnMuY3JlYXRlSW1hZ2VEYXRhID0gZnVuY3Rpb24odyxoKSB7XG4gICAgcmV0dXJuIGN0eC5jcmVhdGVJbWFnZURhdGEodyxoKTtcbiAgfTtcblxuICBGaWx0ZXJzLmNvbnZvbHV0ZSA9IGZ1bmN0aW9uKHBpeGVscywgd2VpZ2h0cywgb3BhcXVlKSB7XG4gICAgdmFyIHNpZGUgPSBNYXRoLnJvdW5kKE1hdGguc3FydCh3ZWlnaHRzLmxlbmd0aCkpO1xuICAgIHZhciBoYWxmU2lkZSA9IE1hdGguZmxvb3Ioc2lkZS8yKTtcbiAgICB2YXIgc3JjID0gcGl4ZWxzLmRhdGE7XG4gICAgdmFyIHN3ID0gcGl4ZWxzLndpZHRoO1xuICAgIHZhciBzaCA9IHBpeGVscy5oZWlnaHQ7XG4gICAgLy8gcGFkIG91dHB1dCBieSB0aGUgY29udm9sdXRpb24gbWF0cml4XG4gICAgdmFyIHcgPSBzdztcbiAgICB2YXIgaCA9IHNoO1xuICAgIHZhciB4LCB5LCBzeCwgc3ksIGN4LCBjeSwgc2N5LCBzY3gsIGRzdE9mZiwgc3JjT2ZmLCB3dCwgciwgZywgYiwgYTtcbiAgICB2YXIgb3V0cHV0ID0gRmlsdGVycy5jcmVhdGVJbWFnZURhdGEod2lkdGgsIGhlaWdodCk7XG4gICAgdmFyIGRzdCA9IG91dHB1dC5kYXRhO1xuICAgIC8vIGdvIHRocm91Z2ggdGhlIGRlc3RpbmF0aW9uIGltYWdlIHBpeGVsc1xuICAgIGZvciAoeT0wOyB5PGg7IHkrKykge1xuICAgICAgZm9yICh4PTA7IHg8dzsgeCsrKSB7XG4gICAgICAgIHN5ID0geTtcbiAgICAgICAgc3ggPSB4O1xuICAgICAgICBkc3RPZmYgPSAoeSp3K3gpKjQ7XG4gICAgICAgIC8vIGNhbGN1bGF0ZSB0aGUgd2VpZ2hlZCBzdW0gb2YgdGhlIHNvdXJjZSBpbWFnZSBwaXhlbHMgdGhhdFxuICAgICAgICAvLyBmYWxsIHVuZGVyIHRoZSBjb252b2x1dGlvbiBtYXRyaXhcbiAgICAgICAgcj0wLCBnPTAsIGI9MCwgYT0wO1xuICAgICAgICBmb3IgKGN5PTA7IGN5PHNpZGU7IGN5KyspIHtcbiAgICAgICAgICBmb3IgKGN4PTA7IGN4PHNpZGU7IGN4KyspIHtcbiAgICAgICAgICAgIHNjeSA9IHN5ICsgY3kgLSBoYWxmU2lkZTtcbiAgICAgICAgICAgIHNjeCA9IHN4ICsgY3ggLSBoYWxmU2lkZTtcbiAgICAgICAgICAgIGlmIChzY3kgPj0gMCAmJiBzY3kgPCBzaCAmJiBzY3ggPj0gMCAmJiBzY3ggPCBzdykge1xuICAgICAgICAgICAgICBzcmNPZmYgPSAoc2N5KnN3K3NjeCkqNDtcbiAgICAgICAgICAgICAgd3QgPSB3ZWlnaHRzW2N5KnNpZGUrY3hdO1xuICAgICAgICAgICAgICByICs9IHNyY1tzcmNPZmZdICogd3Q7XG4gICAgICAgICAgICAgIGcgKz0gc3JjW3NyY09mZisxXSAqIHd0O1xuICAgICAgICAgICAgICBiICs9IHNyY1tzcmNPZmYrMl0gKiB3dDtcbiAgICAgICAgICAgICAgYSArPSBzcmNbc3JjT2ZmKzNdICogd3Q7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGRzdFtkc3RPZmZdID0gcjtcbiAgICAgICAgZHN0W2RzdE9mZisxXSA9IGc7XG4gICAgICAgIGRzdFtkc3RPZmYrMl0gPSBiO1xuICAgICAgICBkc3RbZHN0T2ZmKzNdID0gYTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG91dHB1dDtcbiAgfTtcblxuICB2YXIgZmlsdGVyID0gZnVuY3Rpb24gZmlsdGVyKCkge1xuICAgIHZhciByZXN1bHQgPSBGaWx0ZXJzLmZpbHRlckltYWdlKEZpbHRlcnMuY29udm9sdXRlLCBjdHgsXG4gICAgWyAxLzksIDEvOSwgMS85LFxuICAgICAgMS85LCAxLzksIDEvOSxcbiAgICAgIDEvOSwgMS85LCAxLzkgXVxuICAgICk7XG5cbiAgICBjdHgucHV0SW1hZ2VEYXRhKHJlc3VsdCwgMCwgMCk7XG4gIH07XG5cbiAgcmV0dXJuIHtcbiAgICBmaWx0ZXI6IGZpbHRlclxuICB9O1xufTtcbiIsIlwidXNlIHN0cmljdFwiO1xuLyogZ2xvYmFsIHJlcXVpcmUsIGRlZmluZSwgbW9kdWxlICovXG5cbnZhciBldmVudERyb3BzID0gcmVxdWlyZSgnLi9ldmVudERyb3BzJyk7XG5cbmlmICh0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCkge1xuICBkZWZpbmUoJ2QzLmNoYXJ0LmV2ZW50RHJvcHMnLCBbXCJkM1wiXSwgZnVuY3Rpb24gKGQzKSB7XG4gICAgZDMuY2hhcnQgPSBkMy5jaGFydCB8fCB7fTtcbiAgICBkMy5jaGFydC5ldmVudERyb3BzID0gZXZlbnREcm9wcyhkMywgZG9jdW1lbnQpO1xuICB9KTtcbn0gZWxzZSBpZiAod2luZG93KSB7XG4gIHdpbmRvdy5kMy5jaGFydCA9IHdpbmRvdy5kMy5jaGFydCB8fCB7fTtcbiAgd2luZG93LmQzLmNoYXJ0LmV2ZW50RHJvcHMgPSBldmVudERyb3BzKHdpbmRvdy5kMywgZG9jdW1lbnQpO1xufSBlbHNlIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBldmVudERyb3BzO1xufVxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vKiBnbG9iYWwgcmVxdWlyZSwgbW9kdWxlICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNvbnRleHQsIGNvbmZpZywgZmlsdGVyRGF0YSkge1xuXG4gIGZ1bmN0aW9uIGhleFRvUmdiKGhleCwgYWxwaGEpIHtcbiAgICB2YXIgcmVzdWx0ID0gL14jPyhbYS1mXFxkXXsyfSkoW2EtZlxcZF17Mn0pKFthLWZcXGRdezJ9KSQvaS5leGVjKGhleCk7XG4gICAgdmFyIHRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKCF0aGlzLmFscGhhKSB7XG4gICAgICAgIHJldHVybiBcInJnYihcIiArIHRoaXMuciArIFwiLCBcIiArIHRoaXMuZyArIFwiLCBcIiArIHRoaXMuYiArIFwiKVwiO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMuYWxwaGEgPiAxKSB7XG4gICAgICAgIHRoaXMuYWxwaGEgPSAxO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLmFscGhhIDwgMCkge1xuICAgICAgICB0aGlzLmFscGhhID0gMDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBcInJnYmEoXCIgKyB0aGlzLnIgKyBcIiwgXCIgKyB0aGlzLmcgKyBcIiwgXCIgKyB0aGlzLmIgKyBcIiwgXCIgKyB0aGlzLmFscGhhICsgXCIpXCI7XG4gICAgfTtcbiAgICBpZiAoIWFscGhhKSB7XG4gICAgICByZXR1cm4gcmVzdWx0ID8ge1xuICAgICAgICByOiBwYXJzZUludChyZXN1bHRbMV0sIDE2KSxcbiAgICAgICAgZzogcGFyc2VJbnQocmVzdWx0WzJdLCAxNiksXG4gICAgICAgIGI6IHBhcnNlSW50KHJlc3VsdFszXSwgMTYpLFxuICAgICAgICB0b1N0cmluZzogdG9TdHJpbmdcbiAgICAgIH0gOiBudWxsO1xuICAgIH1cbiAgICBpZiAoYWxwaGEgPiAxKSB7XG4gICAgICBhbHBoYSA9IDE7XG4gICAgfSBlbHNlIGlmIChhbHBoYSA8IDApIHtcbiAgICAgIGFscGhhID0gMDtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdCA/IHtcbiAgICAgIHI6IHBhcnNlSW50KHJlc3VsdFsxXSwgMTYpLFxuICAgICAgZzogcGFyc2VJbnQocmVzdWx0WzJdLCAxNiksXG4gICAgICBiOiBwYXJzZUludChyZXN1bHRbM10sIDE2KSxcbiAgICAgIGFscGhhOiBhbHBoYSxcbiAgICAgIHRvU3RyaW5nOiB0b1N0cmluZ1xuICAgIH0gOiBudWxsO1xuICB9XG5cbiAgdmFyIGRyYXdDdXN0b20gPSBmdW5jdGlvbiBkcmF3Q3VzdG9tIChkYXRhKSB7XG4gICAgdmFyIGRhdGVzID0gZmlsdGVyRGF0YShkYXRhLmRhdGVzLCBjb25maWcueFNjYWxlKTtcbiAgICB2YXIgeSA9IDA7XG4gICAgaWYgKHR5cGVvZiBjb25maWcueVNjYWxlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICB5ID0gY29uZmlnLnlTY2FsZShkYXRhLm5hbWUpICsgMjU7XG4gICAgfWVsc2V7XG4gICAgICB5ID0gY29uZmlnLnlTY2FsZSArIDI1O1xuICAgIH1cbiAgICB2YXIgY29sb3IgPSAnYmxhY2snO1xuICAgIGlmIChjb25maWcuZXZlbnRMaW5lQ29sb3IpIHtcbiAgICAgIGlmICh0eXBlb2YgY29uZmlnLmV2ZW50TGluZUNvbG9yID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGNvbG9yID0gY29uZmlnLmV2ZW50TGluZUNvbG9yKGRhdGEsIGRhdGEubmFtZSk7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgY29sb3IgPSBjb25maWcuZXZlbnRMaW5lQ29sb3I7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIGRhdGVUYWIgPSBkYXRlcy5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgIHJldHVybiBhIC0gYjtcbiAgICB9KTtcblxuICAgIHZhciBjb2xvcnMgPSBoZXhUb1JnYihjb2xvciwgMSk7XG5cbiAgICBpZiAoY29udGV4dCkge1xuICAgICAgZHJhd0xpbmUoZGF0ZVRhYiwgeSwgY29sb3JzLCBjb250ZXh0KTtcbiAgICB9XG4gIH07XG5cbiAgZnVuY3Rpb24gZHJhd0xpbmUoZGF0ZXMsIGNvb3JZLCBjb2xvcnMsIGNvbnRleHQpIHtcbiAgICB2YXIgcG9pbnRzID0gZGF0ZXMubWFwKGZ1bmN0aW9uKGRhdGUpIHtcbiAgICAgIHJldHVybiB7IHg6IGNvbmZpZy54U2NhbGUoZGF0ZSksIHk6IGNvb3JZLCBzaXplOiAxNSB9O1xuICAgIH0pO1xuXG4gICAgZnVuY3Rpb24gdXBkYXRlKCkge1xuICAgICAgdmFyIHN0YXJ0ID0gKG5ldyBEYXRlKCkpLmdldFRpbWUoKTtcbiAgICAgIHZhciBsZW4gPSBwb2ludHMubGVuZ3RoO1xuICAgICAgd2hpbGUgKGxlbi0tKSB7XG4gICAgICAgIHZhciBwb2ludCA9IHBvaW50c1tsZW5dO1xuXG4gICAgICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XG4gICAgICAgIHZhciBncmFkID0gY29udGV4dC5jcmVhdGVSYWRpYWxHcmFkaWVudChwb2ludC54LCBwb2ludC55LCAxLCBwb2ludC54LCBwb2ludC55LCBwb2ludC5zaXplKTtcbiAgICAgICAgaWYgKGNvbG9ycykge1xuICAgICAgICAgIGdyYWQuYWRkQ29sb3JTdG9wKDAsICdyZ2JhKCcgKyBjb2xvcnMuciArJywnICsgY29sb3JzLmcgKyAnLCcgKyBjb2xvcnMuYiArICcsMSknKTtcbiAgICAgICAgICBncmFkLmFkZENvbG9yU3RvcCgxLCAncmdiYSgnICsgY29sb3JzLnIgKycsJyArIGNvbG9ycy5nICsgJywnICsgY29sb3JzLmIgKyAnLDApJyk7XG4gICAgICAgICAgY29udGV4dC5maWxsU3R5bGUgPSBncmFkO1xuICAgICAgICB9XG4gICAgICAgIGNvbnRleHQuYXJjKHBvaW50LngsIHBvaW50LnksIHBvaW50LnNpemUsIDAsIE1hdGguUEkqMik7XG4gICAgICAgIGNvbnRleHQuZmlsbCgpO1xuICAgICAgfVxuICAgICAgbWV0YWJhbGl6ZSgpO1xuICAgICAgLy9jb25zb2xlLmxvZygobmV3IERhdGUoKSkuZ2V0VGltZSgpLXN0YXJ0LCAnbXMgZm9yIGRyYXcnKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBtZXRhYmFsaXplKCkge1xuICAgICAgLyp2YXIgdGhyZXNob2xkID0gMTgwO1xuICAgICAgdmFyIHN0YXJ0ID0gKG5ldyBEYXRlKCkpLmdldFRpbWUoKTtcbiAgICAgIHZhciBpbWFnZURhdGEgPSBjb250ZXh0LmdldEltYWdlRGF0YSgwLDAsY29uZmlnLndpZHRoLGNvbmZpZy5oZWlnaHQpO1xuICAgICAgdmFyIHBpeCA9IGltYWdlRGF0YS5kYXRhO1xuXG4gICAgICBmb3IgKHZhciBpID0gMCwgbiA9IHBpeC5sZW5ndGg7IGkgPCBuOyBpICs9IDQpIHtcbiAgICAgICAgcGl4W2kgKyAzXSA9IHBpeFtpKzNdIDwgdGhyZXNob2xkID8gMCA6IDI1NTtcbiAgICAgIH1cbiAgICAgIGNvbnRleHQucHV0SW1hZ2VEYXRhKGltYWdlRGF0YSwgMCwgMCk7Ki9cbiAgICAgIC8vY29uc29sZS5sb2coKG5ldyBEYXRlKCkpLmdldFRpbWUoKS1zdGFydCwgJ21zIGZvciB0aHJlc2hvbGQnKTtcbiAgICB9XG5cbiAgICB1cGRhdGUoKTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgZHJhd0N1c3RvbTogZHJhd0N1c3RvbVxuICB9O1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY29uZmlndXJhYmxlKHRhcmdldEZ1bmN0aW9uLCBjb25maWcsIGxpc3RlbmVycykge1xuICBsaXN0ZW5lcnMgPSBsaXN0ZW5lcnMgfHwge307XG4gIGZvciAodmFyIGl0ZW0gaW4gY29uZmlnKSB7XG4gICAgKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgIHRhcmdldEZ1bmN0aW9uW2l0ZW1dID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gY29uZmlnW2l0ZW1dO1xuICAgICAgICBjb25maWdbaXRlbV0gPSB2YWx1ZTtcbiAgICAgICAgaWYgKGxpc3RlbmVycy5oYXNPd25Qcm9wZXJ0eShpdGVtKSkge1xuICAgICAgICAgIGxpc3RlbmVyc1tpdGVtXSh2YWx1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGFyZ2V0RnVuY3Rpb247XG4gICAgICB9O1xuICAgIH0pKGl0ZW0pOyAvLyBmb3IgZG9lc24ndCBjcmVhdGUgYSBjbG9zdXJlLCBmb3JjaW5nIGl0XG4gIH1cbn07XG4iLCJcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZDMsIGNvbmZpZywgeFNjYWxlLCBncmFwaCwgZ3JhcGhIZWlnaHQsIHdoZXJlKSB7XG4gIHZhciB4QXhpcyA9IHt9O1xuICB2YXIgeEF4aXNFbHMgPSB7fTtcblxuICB2YXIgdGlja0Zvcm1hdERhdGEgPSBbXTtcblxuICBjb25maWcudGlja0Zvcm1hdC5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgdmFyIHRpY2sgPSBpdGVtLnNsaWNlKDApO1xuICAgIHRpY2tGb3JtYXREYXRhLnB1c2godGljayk7XG4gIH0pO1xuXG4gIHZhciB0aWNrRm9ybWF0ID0gY29uZmlnLmxvY2FsZSA/IGNvbmZpZy5sb2NhbGUudGltZUZvcm1hdC5tdWx0aSh0aWNrRm9ybWF0RGF0YSkgOiBkMy50aW1lLmZvcm1hdC5tdWx0aSh0aWNrRm9ybWF0RGF0YSk7XG4gIHhBeGlzW3doZXJlXSA9IGQzLnN2Zy5heGlzKClcbiAgICAuc2NhbGUoeFNjYWxlKVxuICAgIC5vcmllbnQod2hlcmUpXG4gICAgLnRpY2tGb3JtYXQodGlja0Zvcm1hdClcbiAgO1xuXG4gIGlmICh0eXBlb2YgY29uZmlnLmF4aXNGb3JtYXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICBjb25maWcuYXhpc0Zvcm1hdCh4QXhpcyk7XG4gIH1cblxuICB2YXIgeSA9ICh3aGVyZSA9PSAnYm90dG9tJyA/IHBhcnNlSW50KGdyYXBoSGVpZ2h0KSA6IDApICsgY29uZmlnLm1hcmdpbi50b3AgLSA0MDtcblxuICB4QXhpc0Vsc1t3aGVyZV0gPSBncmFwaFxuICAgIC5hcHBlbmQoJ2cnKVxuICAgIC5jbGFzc2VkKCd4LWF4aXMnLCB0cnVlKVxuICAgIC5jbGFzc2VkKHdoZXJlLCB0cnVlKVxuICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCcgKyBjb25maWcubWFyZ2luLmxlZnQgKyAnLCAnICsgeSArICcpJylcbiAgICAuY2FsbCh4QXhpc1t3aGVyZV0pXG4gIDtcblxuICB2YXIgZHJhd1hBeGlzID0gZnVuY3Rpb24gZHJhd1hBeGlzKCkge1xuICAgIHhBeGlzRWxzW3doZXJlXVxuICAgICAgLmNhbGwoeEF4aXNbd2hlcmVdKVxuICAgIDtcbiAgfTtcblxuICByZXR1cm4ge1xuICAgIGRyYXdYQXhpczogZHJhd1hBeGlzXG4gIH07XG59O1xuIl19
