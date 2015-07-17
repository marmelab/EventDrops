(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
/* global require, module */

var defaultConfig = {
  xScale: null
};

module.exports = function (d3, document, config) {
  return function (config) {

    config = config || {
      xScale: null,
      eventColor: null
    };
    for (var key in defaultConfig) {
     config[key] = config[key] || defaultConfig[key];
    }

    function canvasHandler(x, y) {
      this.graphWidth = x;
      this.graphHeight = y;
      this.lastX = graphWidth/2;
      this.lastY = graphHeight/2;
      this.mouseDown = 0;
      this.ctx = null;
      this.canvas = null;
    }

    /*var graphHeight, graphWidth;
    var lastX, lastY;
    var ctx;
    var mouseDown = 0;
    var dragStart, dragged;*/

    /*var canvasHandler = function () {
      var graphWidth = config.width - config.margin.right - config.margin.left;
      alert(graphWidth);
      var graphHeight = data.length * 40;
      alert(graphHeight);
      var ctx = (canvas.node()).getContext('2d');
      var mouseDown = 0;
      var lastX = graphWidth/2;
      var lastY = graphHeight/2;
    }*/

      this.init = function (selection, x, y) {
        /*this.graphWidth = x;
        this.graphHeight = y;
        this.mouseDown = 0;
        this.lastX = x/2;
        this.lastY = y/2;*/

        selection.each(function (data) {
          d3.select(this).select('canvas').remove();
          var canvas = d3.select(this)
            .append('canvas')
            .attr('id', "mon_canvas")
            .attr('width', this.graphWidth)
            .attr('height', this.graphHeight)
            ;
          this.ctx = canvas.node().getContext('2d');
        });
      }

      this.draw = function(){
        // Clear the entire canvas
        var topX = 0;
        var topY = 0;
        //alert(graphWidth);
        this.ctx.clearRect(topX, topY, topX + graphWidth, topY + graphHeight);

        ctx.font = "30px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Toto",750/2,35);
        ctx.fillText("Toto",750/2,75);
        ctx.fillText("Toto",750/2,115);
        ctx.fillText("Toto",750/2,155);
      }

      this.drawCircle = function (x, y) {
        context.beginPath();
        context.lineWidth="2";
        context.fillStyle="#FF4422";
        context.arc(x, y, 90, 0, 2 * Math.PI);
        context.fill();
      }

      this.mouseDownHandler = function(evt){
        // permits compatibility with every browser
        document.body.style.mozUserSelect = document.body.style.webkitUserSelect = document.body.style.userSelect = 'none';
        //lastX = evt.offsetX || (evt.pageX - canvas.node().offsetLeft);
        lastX = evt.clientX;
        //lastY = graphHeight/2;
        //alert(lastX);
        var dragStart = {
          x : lastX,
          y : lastY
        };
        var dragged = false;
        mouseDown++;

        //canvas.node().addEventListener('mousemove', c.mouseMoveHandler,false);
        //canvas.node().addEventListener('mouseup', c.mouseUpHandler,false);
      }

      this.mouseMoveHandler = function(evt){
        //lastX = evt.offsetX || (evt.pageX - canvas.node().offsetLeft);
        lastX = evt.clientX;
        dragged = true;
        if (dragStart && mouseDown){
          ctx.translate(lastX-dragStart.x, lastY-dragStart.y);
          //ctx.translate([d3.event.translate[0], 0]);
          drawAgain();
        }
      }

      this.mouseUpHandler = function(evt){
        //canvas.node().addEventListener('mousemove', c.mouseMoveHandler,false);
        //canvas.node().addEventListener('mousedown', c.mouseDownHandler,false);

        dragStart = null;
        mouseDown--;
        if (!dragged) zoom(evt.shiftKey ? -1 : 1 );
      }
  }
}

},{}],2:[function(require,module,exports){
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

},{"./util/configurable":7}],3:[function(require,module,exports){
"use strict";
/* global require, module */

var configurable = require('./util/configurable');
var xAxisFactory = require('./xAxis');

module.exports = function (d3, document) {
  var delimiter = require('./delimiter')(d3);
  var canvasHandler = require('./canvasHandler')(d3, document);
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

        //canvas.node().style.webkitFilter = "blur(1px)";

        canvas.style.webkitFilter = "blur(10px)";

        var eventLine = require('./eventLine')(d3, ctx);

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

          var result = Filters.filterImage(Filters.convolute, ctx,
            [ 1/9, 1/9, 1/9,
              1/9, 1/9, 1/9,
              1/9, 1/9, 1/9 ]
          );

          ctx.putImageData(result, 0, 0);
        }

        redraw();
        if (config.hasDelimiter) {
          redrawDelimiter(xScale);
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

},{"./canvasHandler":1,"./delimiter":2,"./eventLine":4,"./filterData":5,"./util/configurable":7,"./xAxis":8}],4:[function(require,module,exports){
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

},{"./filterData":5,"./util/configurable":7}],5:[function(require,module,exports){
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

},{"./eventDrops":3}],7:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwibGliL2NhbnZhc0hhbmRsZXIuanMiLCJsaWIvZGVsaW1pdGVyLmpzIiwibGliL2V2ZW50RHJvcHMuanMiLCJsaWIvZXZlbnRMaW5lLmpzIiwibGliL2ZpbHRlckRhdGEuanMiLCJsaWIvbWFpbi5qcyIsImxpYi91dGlsL2NvbmZpZ3VyYWJsZS5qcyIsImxpYi94QXhpcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcInVzZSBzdHJpY3RcIjtcbi8qIGdsb2JhbCByZXF1aXJlLCBtb2R1bGUgKi9cblxudmFyIGRlZmF1bHRDb25maWcgPSB7XG4gIHhTY2FsZTogbnVsbFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZDMsIGRvY3VtZW50LCBjb25maWcpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChjb25maWcpIHtcblxuICAgIGNvbmZpZyA9IGNvbmZpZyB8fCB7XG4gICAgICB4U2NhbGU6IG51bGwsXG4gICAgICBldmVudENvbG9yOiBudWxsXG4gICAgfTtcbiAgICBmb3IgKHZhciBrZXkgaW4gZGVmYXVsdENvbmZpZykge1xuICAgICBjb25maWdba2V5XSA9IGNvbmZpZ1trZXldIHx8IGRlZmF1bHRDb25maWdba2V5XTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjYW52YXNIYW5kbGVyKHgsIHkpIHtcbiAgICAgIHRoaXMuZ3JhcGhXaWR0aCA9IHg7XG4gICAgICB0aGlzLmdyYXBoSGVpZ2h0ID0geTtcbiAgICAgIHRoaXMubGFzdFggPSBncmFwaFdpZHRoLzI7XG4gICAgICB0aGlzLmxhc3RZID0gZ3JhcGhIZWlnaHQvMjtcbiAgICAgIHRoaXMubW91c2VEb3duID0gMDtcbiAgICAgIHRoaXMuY3R4ID0gbnVsbDtcbiAgICAgIHRoaXMuY2FudmFzID0gbnVsbDtcbiAgICB9XG5cbiAgICAvKnZhciBncmFwaEhlaWdodCwgZ3JhcGhXaWR0aDtcbiAgICB2YXIgbGFzdFgsIGxhc3RZO1xuICAgIHZhciBjdHg7XG4gICAgdmFyIG1vdXNlRG93biA9IDA7XG4gICAgdmFyIGRyYWdTdGFydCwgZHJhZ2dlZDsqL1xuXG4gICAgLyp2YXIgY2FudmFzSGFuZGxlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBncmFwaFdpZHRoID0gY29uZmlnLndpZHRoIC0gY29uZmlnLm1hcmdpbi5yaWdodCAtIGNvbmZpZy5tYXJnaW4ubGVmdDtcbiAgICAgIGFsZXJ0KGdyYXBoV2lkdGgpO1xuICAgICAgdmFyIGdyYXBoSGVpZ2h0ID0gZGF0YS5sZW5ndGggKiA0MDtcbiAgICAgIGFsZXJ0KGdyYXBoSGVpZ2h0KTtcbiAgICAgIHZhciBjdHggPSAoY2FudmFzLm5vZGUoKSkuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICAgIHZhciBtb3VzZURvd24gPSAwO1xuICAgICAgdmFyIGxhc3RYID0gZ3JhcGhXaWR0aC8yO1xuICAgICAgdmFyIGxhc3RZID0gZ3JhcGhIZWlnaHQvMjtcbiAgICB9Ki9cblxuICAgICAgdGhpcy5pbml0ID0gZnVuY3Rpb24gKHNlbGVjdGlvbiwgeCwgeSkge1xuICAgICAgICAvKnRoaXMuZ3JhcGhXaWR0aCA9IHg7XG4gICAgICAgIHRoaXMuZ3JhcGhIZWlnaHQgPSB5O1xuICAgICAgICB0aGlzLm1vdXNlRG93biA9IDA7XG4gICAgICAgIHRoaXMubGFzdFggPSB4LzI7XG4gICAgICAgIHRoaXMubGFzdFkgPSB5LzI7Ki9cblxuICAgICAgICBzZWxlY3Rpb24uZWFjaChmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgIGQzLnNlbGVjdCh0aGlzKS5zZWxlY3QoJ2NhbnZhcycpLnJlbW92ZSgpO1xuICAgICAgICAgIHZhciBjYW52YXMgPSBkMy5zZWxlY3QodGhpcylcbiAgICAgICAgICAgIC5hcHBlbmQoJ2NhbnZhcycpXG4gICAgICAgICAgICAuYXR0cignaWQnLCBcIm1vbl9jYW52YXNcIilcbiAgICAgICAgICAgIC5hdHRyKCd3aWR0aCcsIHRoaXMuZ3JhcGhXaWR0aClcbiAgICAgICAgICAgIC5hdHRyKCdoZWlnaHQnLCB0aGlzLmdyYXBoSGVpZ2h0KVxuICAgICAgICAgICAgO1xuICAgICAgICAgIHRoaXMuY3R4ID0gY2FudmFzLm5vZGUoKS5nZXRDb250ZXh0KCcyZCcpO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5kcmF3ID0gZnVuY3Rpb24oKXtcbiAgICAgICAgLy8gQ2xlYXIgdGhlIGVudGlyZSBjYW52YXNcbiAgICAgICAgdmFyIHRvcFggPSAwO1xuICAgICAgICB2YXIgdG9wWSA9IDA7XG4gICAgICAgIC8vYWxlcnQoZ3JhcGhXaWR0aCk7XG4gICAgICAgIHRoaXMuY3R4LmNsZWFyUmVjdCh0b3BYLCB0b3BZLCB0b3BYICsgZ3JhcGhXaWR0aCwgdG9wWSArIGdyYXBoSGVpZ2h0KTtcblxuICAgICAgICBjdHguZm9udCA9IFwiMzBweCBBcmlhbFwiO1xuICAgICAgICBjdHgudGV4dEFsaWduID0gXCJjZW50ZXJcIjtcbiAgICAgICAgY3R4LmZpbGxUZXh0KFwiVG90b1wiLDc1MC8yLDM1KTtcbiAgICAgICAgY3R4LmZpbGxUZXh0KFwiVG90b1wiLDc1MC8yLDc1KTtcbiAgICAgICAgY3R4LmZpbGxUZXh0KFwiVG90b1wiLDc1MC8yLDExNSk7XG4gICAgICAgIGN0eC5maWxsVGV4dChcIlRvdG9cIiw3NTAvMiwxNTUpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmRyYXdDaXJjbGUgPSBmdW5jdGlvbiAoeCwgeSkge1xuICAgICAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgICAgICBjb250ZXh0LmxpbmVXaWR0aD1cIjJcIjtcbiAgICAgICAgY29udGV4dC5maWxsU3R5bGU9XCIjRkY0NDIyXCI7XG4gICAgICAgIGNvbnRleHQuYXJjKHgsIHksIDkwLCAwLCAyICogTWF0aC5QSSk7XG4gICAgICAgIGNvbnRleHQuZmlsbCgpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLm1vdXNlRG93bkhhbmRsZXIgPSBmdW5jdGlvbihldnQpe1xuICAgICAgICAvLyBwZXJtaXRzIGNvbXBhdGliaWxpdHkgd2l0aCBldmVyeSBicm93c2VyXG4gICAgICAgIGRvY3VtZW50LmJvZHkuc3R5bGUubW96VXNlclNlbGVjdCA9IGRvY3VtZW50LmJvZHkuc3R5bGUud2Via2l0VXNlclNlbGVjdCA9IGRvY3VtZW50LmJvZHkuc3R5bGUudXNlclNlbGVjdCA9ICdub25lJztcbiAgICAgICAgLy9sYXN0WCA9IGV2dC5vZmZzZXRYIHx8IChldnQucGFnZVggLSBjYW52YXMubm9kZSgpLm9mZnNldExlZnQpO1xuICAgICAgICBsYXN0WCA9IGV2dC5jbGllbnRYO1xuICAgICAgICAvL2xhc3RZID0gZ3JhcGhIZWlnaHQvMjtcbiAgICAgICAgLy9hbGVydChsYXN0WCk7XG4gICAgICAgIHZhciBkcmFnU3RhcnQgPSB7XG4gICAgICAgICAgeCA6IGxhc3RYLFxuICAgICAgICAgIHkgOiBsYXN0WVxuICAgICAgICB9O1xuICAgICAgICB2YXIgZHJhZ2dlZCA9IGZhbHNlO1xuICAgICAgICBtb3VzZURvd24rKztcblxuICAgICAgICAvL2NhbnZhcy5ub2RlKCkuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgYy5tb3VzZU1vdmVIYW5kbGVyLGZhbHNlKTtcbiAgICAgICAgLy9jYW52YXMubm9kZSgpLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBjLm1vdXNlVXBIYW5kbGVyLGZhbHNlKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5tb3VzZU1vdmVIYW5kbGVyID0gZnVuY3Rpb24oZXZ0KXtcbiAgICAgICAgLy9sYXN0WCA9IGV2dC5vZmZzZXRYIHx8IChldnQucGFnZVggLSBjYW52YXMubm9kZSgpLm9mZnNldExlZnQpO1xuICAgICAgICBsYXN0WCA9IGV2dC5jbGllbnRYO1xuICAgICAgICBkcmFnZ2VkID0gdHJ1ZTtcbiAgICAgICAgaWYgKGRyYWdTdGFydCAmJiBtb3VzZURvd24pe1xuICAgICAgICAgIGN0eC50cmFuc2xhdGUobGFzdFgtZHJhZ1N0YXJ0LngsIGxhc3RZLWRyYWdTdGFydC55KTtcbiAgICAgICAgICAvL2N0eC50cmFuc2xhdGUoW2QzLmV2ZW50LnRyYW5zbGF0ZVswXSwgMF0pO1xuICAgICAgICAgIGRyYXdBZ2FpbigpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMubW91c2VVcEhhbmRsZXIgPSBmdW5jdGlvbihldnQpe1xuICAgICAgICAvL2NhbnZhcy5ub2RlKCkuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgYy5tb3VzZU1vdmVIYW5kbGVyLGZhbHNlKTtcbiAgICAgICAgLy9jYW52YXMubm9kZSgpLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIGMubW91c2VEb3duSGFuZGxlcixmYWxzZSk7XG5cbiAgICAgICAgZHJhZ1N0YXJ0ID0gbnVsbDtcbiAgICAgICAgbW91c2VEb3duLS07XG4gICAgICAgIGlmICghZHJhZ2dlZCkgem9vbShldnQuc2hpZnRLZXkgPyAtMSA6IDEgKTtcbiAgICAgIH1cbiAgfVxufVxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vKiBnbG9iYWwgcmVxdWlyZSwgbW9kdWxlLCBkMyAqL1xuXG52YXIgY29uZmlndXJhYmxlID0gcmVxdWlyZSgnLi91dGlsL2NvbmZpZ3VyYWJsZScpO1xuXG52YXIgZGVmYXVsdENvbmZpZyA9IHtcbiAgeFNjYWxlOiBudWxsLFxuICBkYXRlRm9ybWF0OiBudWxsXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChkMykge1xuXG4gIHJldHVybiBmdW5jdGlvbiAoY29uZmlnKSB7XG5cbiAgICBjb25maWcgPSBjb25maWcgfHwge307XG4gICAgZm9yICh2YXIga2V5IGluIGRlZmF1bHRDb25maWcpIHtcbiAgICAgIGNvbmZpZ1trZXldID0gY29uZmlnW2tleV0gfHwgZGVmYXVsdENvbmZpZ1trZXldO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGRlbGltaXRlcihzZWxlY3Rpb24pIHtcbiAgICAgIHNlbGVjdGlvbi5lYWNoKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgIGQzLnNlbGVjdCh0aGlzKS5zZWxlY3RBbGwoJ3RleHQnKS5yZW1vdmUoKTtcblxuICAgICAgICB2YXIgbGltaXRzID0gY29uZmlnLnhTY2FsZS5kb21haW4oKTtcblxuICAgICAgICBkMy5zZWxlY3QodGhpcykuYXBwZW5kKCd0ZXh0JylcbiAgICAgICAgICAudGV4dChmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgIHJldHVybiBjb25maWcuZGF0ZUZvcm1hdChsaW1pdHNbMF0pO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLmNsYXNzZWQoJ3N0YXJ0JywgdHJ1ZSlcbiAgICAgICAgO1xuXG4gICAgICAgIGQzLnNlbGVjdCh0aGlzKS5hcHBlbmQoJ3RleHQnKVxuICAgICAgICAgIC50ZXh0KGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgcmV0dXJuIGNvbmZpZy5kYXRlRm9ybWF0KGxpbWl0c1sxXSk7XG4gICAgICAgICAgfSlcbiAgICAgICAgICAuYXR0cigndGV4dC1hbmNob3InLCAnZW5kJylcbiAgICAgICAgICAuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgnICsgY29uZmlnLnhTY2FsZS5yYW5nZSgpWzFdICsgJyknKVxuICAgICAgICAgIC5jbGFzc2VkKCdlbmQnLCB0cnVlKVxuICAgICAgICA7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBjb25maWd1cmFibGUoZGVsaW1pdGVyLCBjb25maWcpO1xuXG4gICAgcmV0dXJuIGRlbGltaXRlcjtcbiAgfTtcbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcbi8qIGdsb2JhbCByZXF1aXJlLCBtb2R1bGUgKi9cblxudmFyIGNvbmZpZ3VyYWJsZSA9IHJlcXVpcmUoJy4vdXRpbC9jb25maWd1cmFibGUnKTtcbnZhciB4QXhpc0ZhY3RvcnkgPSByZXF1aXJlKCcuL3hBeGlzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGQzLCBkb2N1bWVudCkge1xuICB2YXIgZGVsaW1pdGVyID0gcmVxdWlyZSgnLi9kZWxpbWl0ZXInKShkMyk7XG4gIHZhciBjYW52YXNIYW5kbGVyID0gcmVxdWlyZSgnLi9jYW52YXNIYW5kbGVyJykoZDMsIGRvY3VtZW50KTtcbiAgdmFyIGZpbHRlckRhdGEgPSByZXF1aXJlKCcuL2ZpbHRlckRhdGEnKTtcblxuICB2YXIgZGVmYXVsdENvbmZpZyA9IHtcblx0XHRzdGFydDogbmV3IERhdGUoMCksXG5cdFx0ZW5kOiBuZXcgRGF0ZSgpLFxuXHRcdG1pblNjYWxlOiAwLFxuXHRcdG1heFNjYWxlOiBJbmZpbml0eSxcblx0XHR3aWR0aDogMTAwMCxcblx0XHRtYXJnaW46IHtcblx0XHQgIHRvcDogNjAsXG5cdFx0ICBsZWZ0OiAyMDAsXG5cdFx0ICBib3R0b206IDQwLFxuXHRcdCAgcmlnaHQ6IDUwXG5cdFx0fSxcblx0XHRsb2NhbGU6IG51bGwsXG5cdFx0YXhpc0Zvcm1hdDogbnVsbCxcblx0XHR0aWNrRm9ybWF0OiBbXG5cdFx0XHRbXCIuJUxcIiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gZC5nZXRNaWxsaXNlY29uZHMoKTsgfV0sXG5cdFx0XHRbXCI6JVNcIiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gZC5nZXRTZWNvbmRzKCk7IH1dLFxuXHRcdFx0W1wiJUk6JU1cIiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gZC5nZXRNaW51dGVzKCk7IH1dLFxuXHRcdFx0W1wiJUkgJXBcIiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gZC5nZXRIb3VycygpOyB9XSxcblx0XHRcdFtcIiVhICVkXCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQuZ2V0RGF5KCkgJiYgZC5nZXREYXRlKCkgIT0gMTsgfV0sXG5cdFx0XHRbXCIlYiAlZFwiLCBmdW5jdGlvbihkKSB7IHJldHVybiBkLmdldERhdGUoKSAhPSAxOyB9XSxcblx0XHRcdFtcIiVCXCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQuZ2V0TW9udGgoKTsgfV0sXG5cdFx0XHRbXCIlWVwiLCBmdW5jdGlvbigpIHsgcmV0dXJuIHRydWU7IH1dXG5cdFx0XSxcblx0XHRldmVudEhvdmVyOiBudWxsLFxuXHRcdGV2ZW50Wm9vbTogbnVsbCxcblx0XHRldmVudENsaWNrOiBudWxsLFxuXHRcdGhhc0RlbGltaXRlcjogdHJ1ZSxcblx0XHRoYXNUb3BBeGlzOiB0cnVlLFxuXHRcdGhhc0JvdHRvbUF4aXM6IGZ1bmN0aW9uIChkYXRhKSB7XG5cdFx0ICByZXR1cm4gZGF0YS5sZW5ndGggPj0gMTA7XG5cdFx0fSxcblx0XHRldmVudExpbmVDb2xvcjogJ2JsYWNrJyxcblx0XHRldmVudENvbG9yOiBudWxsXG4gIH07XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIGV2ZW50RHJvcHMoY29uZmlnKSB7XG5cdFx0dmFyIHhTY2FsZSA9IGQzLnRpbWUuc2NhbGUoKTtcblx0XHR2YXIgeVNjYWxlID0gZDMuc2NhbGUub3JkaW5hbCgpO1xuXHRcdGNvbmZpZyA9IGNvbmZpZyB8fCB7fTtcblx0XHRmb3IgKHZhciBrZXkgaW4gZGVmYXVsdENvbmZpZykge1xuXHRcdCAgY29uZmlnW2tleV0gPSBjb25maWdba2V5XSB8fCBkZWZhdWx0Q29uZmlnW2tleV07XG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gZXZlbnREcm9wR3JhcGgoc2VsZWN0aW9uKSB7XG5cdFx0ICBzZWxlY3Rpb24uZWFjaChmdW5jdGlvbiAoZGF0YSkge1xuXHRcdFx0XHR2YXIgem9vbSA9IGQzLmJlaGF2aW9yLnpvb20oKS5jZW50ZXIobnVsbCkuc2NhbGVFeHRlbnQoW2NvbmZpZy5taW5TY2FsZSwgY29uZmlnLm1heFNjYWxlXSkub24oXCJ6b29tXCIsIHVwZGF0ZVpvb20pO1xuXG5cdFx0XHRcdHpvb20ub24oXCJ6b29tZW5kXCIsIHpvb21FbmQpO1xuXG4gICAgICAgIHZhciBncmFwaFdpZHRoID0gY29uZmlnLndpZHRoIC0gY29uZmlnLm1hcmdpbi5yaWdodCAtIGNvbmZpZy5tYXJnaW4ubGVmdDtcbiAgICAgICAgdmFyIGdyYXBoSGVpZ2h0ID0gZGF0YS5sZW5ndGggKiA0MDtcbiAgICAgICAgdmFyIGhlaWdodCA9IGdyYXBoSGVpZ2h0ICsgY29uZmlnLm1hcmdpbi50b3AgKyBjb25maWcubWFyZ2luLmJvdHRvbTtcbiAgICAgICAgdmFyIHhBeGlzVG9wLCB4QXhpc0JvdHRvbTtcblxuICAgICAgICB2YXIgY2FudmFzX3dpZHRoID0gZ3JhcGhXaWR0aDtcbiAgICAgICAgdmFyIGNhbnZhc19oZWlnaHQgPSBncmFwaEhlaWdodDtcblxuICAgICAgICB2YXIgbGFzdFggPSBncmFwaFdpZHRoLzI7XG4gICAgICAgIHZhciBsYXN0WSA9IGdyYXBoSGVpZ2h0LzI7XG4gICAgICAgIHZhciBkcmFnZ2VkLCBkcmFnU3RhcnQ7XG4gICAgICAgIHZhciBtb3VzZURvd24gPSAwO1xuXG4gICAgICAgIHZhciB0b3BYID0gMDtcbiAgICAgICAgdmFyIHRvcFkgPSAwO1xuXG4gICAgICAgIHZhciBiYXNlID0gZDMuc2VsZWN0KHRoaXMpO1xuXG4gICAgICAgIGQzLnNlbGVjdCh0aGlzKS5zZWxlY3QoJ2NhbnZhcycpLnJlbW92ZSgpO1xuICAgIFx0XHR2YXIgY2FudmFzID0gZDMuc2VsZWN0KHRoaXMpXG4gICAgXHRcdCAgLmFwcGVuZCgnY2FudmFzJylcbiAgICBcdFx0ICAuYXR0cignaWQnLCBcIm1vbl9jYW52YXNcIilcbiAgICBcdFx0ICAuYXR0cignd2lkdGgnLCBjYW52YXNfd2lkdGgpXG4gICAgXHRcdCAgLmF0dHIoJ2hlaWdodCcsIGNhbnZhc19oZWlnaHQpO1xuXG4gIFx0XHQgIHZhciBjdHggPSAoY2FudmFzLm5vZGUoKSkuZ2V0Q29udGV4dCgnMmQnKTtcblxuICAgICAgICAvL2NhbnZhcy5ub2RlKCkuc3R5bGUud2Via2l0RmlsdGVyID0gXCJibHVyKDFweClcIjtcblxuICAgICAgICBjYW52YXMuc3R5bGUud2Via2l0RmlsdGVyID0gXCJibHVyKDEwcHgpXCI7XG5cbiAgICAgICAgdmFyIGV2ZW50TGluZSA9IHJlcXVpcmUoJy4vZXZlbnRMaW5lJykoZDMsIGN0eCk7XG5cbiAgXHRcdFx0ZDMuc2VsZWN0KHRoaXMpLnNlbGVjdCgnc3ZnJykucmVtb3ZlKCk7XG5cbiAgXHRcdFx0dmFyIHN2ZyA9IGQzLnNlbGVjdCh0aGlzKVxuICBcdFx0XHQgIC5hcHBlbmQoJ3N2ZycpXG4gIFx0XHRcdCAgLmF0dHIoJ3dpZHRoJywgY29uZmlnLndpZHRoKVxuICBcdFx0XHQgIC5hdHRyKCdoZWlnaHQnLCBoZWlnaHQpXG4gIFx0XHRcdDtcblxuICBcdFx0XHR2YXIgZ3JhcGggPSBzdmcuYXBwZW5kKCdnJylcbiAgXHRcdFx0ICAuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgwLCAyNSknKTtcblxuICBcdFx0XHR2YXIgeURvbWFpbiA9IFtdO1xuICBcdFx0XHR2YXIgeVJhbmdlID0gW107XG5cbiAgXHRcdFx0ZGF0YS5mb3JFYWNoKGZ1bmN0aW9uIChldmVudCwgaW5kZXgpIHtcbiAgXHRcdFx0ICB5RG9tYWluLnB1c2goZXZlbnQubmFtZSk7XG4gIFx0XHRcdCAgeVJhbmdlLnB1c2goaW5kZXggKiA0MCk7XG4gIFx0XHRcdH0pO1xuXG4gIFx0XHRcdHlTY2FsZS5kb21haW4oeURvbWFpbikucmFuZ2UoeVJhbmdlKTtcblxuXG4gIFx0XHRcdHZhciB5QXhpc0VsID0gZ3JhcGguYXBwZW5kKCdnJylcbiAgXHRcdFx0ICAuY2xhc3NlZCgneS1heGlzJywgdHJ1ZSlcbiAgXHRcdFx0ICAuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgwLCA2MCknKTtcblxuICBcdFx0XHR2YXIgeVRpY2sgPSB5QXhpc0VsLmFwcGVuZCgnZycpLnNlbGVjdEFsbCgnZycpLmRhdGEoeURvbWFpbik7XG5cbiAgXHRcdFx0eVRpY2suZW50ZXIoKVxuICBcdFx0XHQgIC5hcHBlbmQoJ2cnKVxuICBcdFx0XHQgIC5hdHRyKCd0cmFuc2Zvcm0nLCBmdW5jdGlvbihkKSB7XG4gIFx0XHRcdFx0cmV0dXJuICd0cmFuc2xhdGUoMCwgJyArIHlTY2FsZShkKSArICcpJztcbiAgXHRcdFx0ICB9KVxuICBcdFx0XHQgIC5hcHBlbmQoJ2xpbmUnKVxuICBcdFx0XHQgIC5jbGFzc2VkKCd5LXRpY2snLCB0cnVlKVxuICBcdFx0XHQgIC5hdHRyKCd4MScsIGNvbmZpZy5tYXJnaW4ubGVmdClcbiAgXHRcdFx0ICAuYXR0cigneDInLCBjb25maWcubWFyZ2luLmxlZnQgKyBncmFwaFdpZHRoKTtcblxuXHRcdFx0ICB5VGljay5leGl0KCkucmVtb3ZlKCk7XG5cbiAgXHRcdFx0dmFyIGN1cngsIGN1cnk7XG4gIFx0XHRcdHZhciB6b29tUmVjdCA9IHN2Z1xuICBcdFx0XHQgIC5hcHBlbmQoJ3JlY3QnKVxuICBcdFx0XHQgIC5jYWxsKHpvb20pXG4gIFx0XHRcdCAgLmNsYXNzZWQoJ3pvb20nLCB0cnVlKVxuICBcdFx0XHQgIC5hdHRyKCd3aWR0aCcsIGdyYXBoV2lkdGgpXG4gIFx0XHRcdCAgLmF0dHIoJ2hlaWdodCcsIGhlaWdodCApXG4gIFx0XHRcdCAgLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoJyArIGNvbmZpZy5tYXJnaW4ubGVmdCArICcsIDM1KScpXG4gIFx0XHRcdDtcblxuICBcdFx0XHRpZiAodHlwZW9mIGNvbmZpZy5ldmVudEhvdmVyID09PSAnZnVuY3Rpb24nKSB7XG4gIFx0XHRcdCAgem9vbVJlY3Qub24oJ21vdXNlbW92ZScsIGZ1bmN0aW9uKGQsIGUpIHtcbiAgXHRcdFx0XHR2YXIgZXZlbnQgPSBkMy5ldmVudDtcbiAgXHRcdFx0XHRpZiAoY3VyeCA9PSBldmVudC5jbGllbnRYICYmIGN1cnkgPT0gZXZlbnQuY2xpZW50WSkgcmV0dXJuO1xuICBcdFx0XHRcdGN1cnggPSBldmVudC5jbGllbnRYO1xuICBcdFx0XHRcdGN1cnkgPSBldmVudC5jbGllbnRZO1xuICBcdFx0XHRcdHpvb21SZWN0LmF0dHIoJ2Rpc3BsYXknLCAnbm9uZScpO1xuICBcdFx0XHRcdHZhciBlbCA9IGRvY3VtZW50LmVsZW1lbnRGcm9tUG9pbnQoZDMuZXZlbnQuY2xpZW50WCwgZDMuZXZlbnQuY2xpZW50WSk7XG4gIFx0XHRcdFx0em9vbVJlY3QuYXR0cignZGlzcGxheScsICdibG9jaycpO1xuICBcdFx0XHRcdGlmIChlbC50YWdOYW1lICE9PSAnY2lyY2xlJykgcmV0dXJuO1xuICBcdFx0XHRcdGNvbmZpZy5ldmVudEhvdmVyKGVsKTtcbiAgXHRcdFx0ICB9KTtcbiAgXHRcdFx0fVxuXG4gIFx0XHRcdGlmICh0eXBlb2YgY29uZmlnLmV2ZW50Q2xpY2sgPT09ICdmdW5jdGlvbicpIHtcbiAgXHRcdFx0ICB6b29tUmVjdC5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG4gIFx0XHRcdFx0em9vbVJlY3QuYXR0cignZGlzcGxheScsICdub25lJyk7XG4gIFx0XHRcdFx0dmFyIGVsID0gZG9jdW1lbnQuZWxlbWVudEZyb21Qb2ludChkMy5ldmVudC5jbGllbnRYLCBkMy5ldmVudC5jbGllbnRZKTtcbiAgXHRcdFx0XHR6b29tUmVjdC5hdHRyKCdkaXNwbGF5JywgJ2Jsb2NrJyk7XG4gIFx0XHRcdFx0aWYgKGVsLnRhZ05hbWUgIT09ICdjaXJjbGUnKSByZXR1cm47XG4gIFx0XHRcdFx0Y29uZmlnLmV2ZW50Q2xpY2soZWwpO1xuICBcdFx0XHQgIH0pO1xuICBcdFx0XHR9XG5cbiAgICAgICAgeFNjYWxlLnJhbmdlKFswLCBncmFwaFdpZHRoXSkuZG9tYWluKFtjb25maWcuc3RhcnQsIGNvbmZpZy5lbmRdKTtcblxuICAgICAgICB6b29tLngoeFNjYWxlKTtcblxuICAgICAgICBmdW5jdGlvbiB1cGRhdGVab29tKCkge1xuICAgICAgICAgIGlmIChkMy5ldmVudC5zb3VyY2VFdmVudCAmJiBkMy5ldmVudC5zb3VyY2VFdmVudC50b1N0cmluZygpID09PSAnW29iamVjdCBNb3VzZUV2ZW50XScpIHtcbiAgICAgICAgICAgIHpvb20udHJhbnNsYXRlKFtkMy5ldmVudC50cmFuc2xhdGVbMF0sIDBdKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoZDMuZXZlbnQuc291cmNlRXZlbnQgJiYgZDMuZXZlbnQuc291cmNlRXZlbnQudG9TdHJpbmcoKSA9PT0gJ1tvYmplY3QgV2hlZWxFdmVudF0nKSB7XG4gICAgICAgICAgICB6b29tLnNjYWxlKGQzLmV2ZW50LnNjYWxlKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmVkcmF3KCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBpbml0aWFsaXphdGlvbiBvZiB0aGUgZGVsaW1pdGVyXG4gICAgICAgIHN2Zy5zZWxlY3QoJy5kZWxpbWl0ZXInKS5yZW1vdmUoKTtcbiAgICAgICAgdmFyIGRlbGltaXRlckVsID0gc3ZnXG4gICAgICAgICAgLmFwcGVuZCgnZycpXG4gICAgICAgICAgLmNsYXNzZWQoJ2RlbGltaXRlcicsIHRydWUpXG4gICAgICAgICAgLmF0dHIoJ3dpZHRoJywgZ3JhcGhXaWR0aClcbiAgICAgICAgICAuYXR0cignaGVpZ2h0JywgMTApXG4gICAgICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoJyArIGNvbmZpZy5tYXJnaW4ubGVmdCArICcsICcgKyAoY29uZmlnLm1hcmdpbi50b3AgLSA0NSkgKyAnKScpXG4gICAgICAgICAgLmNhbGwoZGVsaW1pdGVyKHtcbiAgICAgICAgICAgIHhTY2FsZTogeFNjYWxlLFxuICAgICAgICAgICAgZGF0ZUZvcm1hdDogY29uZmlnLmxvY2FsZSA/IGNvbmZpZy5sb2NhbGUudGltZUZvcm1hdChcIiVkICVCICVZXCIpIDogZDMudGltZS5mb3JtYXQoXCIlZCAlQiAlWVwiKVxuICAgICAgICAgIH0pKVxuICAgICAgICA7XG5cbiAgICAgICAgZnVuY3Rpb24gcmVkcmF3RGVsaW1pdGVyKCkge1xuICAgICAgICAgIGRlbGltaXRlckVsLmNhbGwoZGVsaW1pdGVyKHtcbiAgICAgICAgICAgIHhTY2FsZTogeFNjYWxlLFxuICAgICAgICAgICAgZGF0ZUZvcm1hdDogY29uZmlnLmxvY2FsZSA/IGNvbmZpZy5sb2NhbGUudGltZUZvcm1hdChcIiVkICVCICVZXCIpIDogZDMudGltZS5mb3JtYXQoXCIlZCAlQiAlWVwiKVxuICAgICAgICAgIH0pKTtcbiAgICAgICAgfVxuXG4gIFx0XHRcdGZ1bmN0aW9uIHpvb21FbmQoKSB7XG4gIFx0XHRcdCAgaWYgKGNvbmZpZy5ldmVudFpvb20pIHtcbiAgXHRcdFx0XHQgIGNvbmZpZy5ldmVudFpvb20oeFNjYWxlKTtcbiAgXHRcdFx0ICB9XG4gIFx0XHRcdCAgaWYgKGNvbmZpZy5oYXNEZWxpbWl0ZXIpIHtcbiAgXHRcdFx0XHQgIHJlZHJhd0RlbGltaXRlcigpO1xuICBcdFx0XHQgIH1cbiAgXHRcdFx0fVxuXG4gICAgICAgIHZhciBoYXNUb3BBeGlzID0gdHlwZW9mIGNvbmZpZy5oYXNUb3BBeGlzID09PSAnZnVuY3Rpb24nID8gY29uZmlnLmhhc1RvcEF4aXMoZGF0YSkgOiBjb25maWcuaGFzVG9wQXhpcztcbiAgICAgICAgaWYgKGhhc1RvcEF4aXMpIHtcbiAgICAgICAgICB4QXhpc1RvcCA9IHhBeGlzRmFjdG9yeShkMywgY29uZmlnLCB4U2NhbGUsIGdyYXBoLCBncmFwaEhlaWdodCwgJ3RvcCcpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGhhc0JvdHRvbUF4aXMgPSB0eXBlb2YgY29uZmlnLmhhc0JvdHRvbUF4aXMgPT09ICdmdW5jdGlvbicgPyBjb25maWcuaGFzQm90dG9tQXhpcyhkYXRhKSA6IGNvbmZpZy5oYXNCb3R0b21BeGlzO1xuICAgICAgICBpZiAoaGFzQm90dG9tQXhpcykge1xuICAgICAgICAgIHhBeGlzQm90dG9tID0geEF4aXNGYWN0b3J5KGQzLCBjb25maWcsIHhTY2FsZSwgZ3JhcGgsIGdyYXBoSGVpZ2h0LCAnYm90dG9tJyk7XG4gICAgICAgIH1cblxuICBcdFx0XHRmdW5jdGlvbiBkcmF3WEF4aXMod2hlcmUpIHtcblxuICBcdFx0XHQgIC8vIGNvcHkgY29uZmlnLnRpY2tGb3JtYXQgYmVjYXVzZSBkMyBmb3JtYXQubXVsdGkgZWRpdCBpdHMgZ2l2ZW4gdGlja0Zvcm1hdCBkYXRhXG4gIFx0XHRcdCAgdmFyIHRpY2tGb3JtYXREYXRhID0gW107XG5cbiAgXHRcdFx0ICBjb25maWcudGlja0Zvcm1hdC5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtKSB7XG4gIFx0XHRcdFx0dmFyIHRpY2sgPSBpdGVtLnNsaWNlKDApO1xuICBcdFx0XHRcdHRpY2tGb3JtYXREYXRhLnB1c2godGljayk7XG4gIFx0XHRcdCAgfSk7XG5cbiAgXHRcdFx0ICB2YXIgdGlja0Zvcm1hdCA9IGNvbmZpZy5sb2NhbGUgPyBjb25maWcubG9jYWxlLnRpbWVGb3JtYXQubXVsdGkodGlja0Zvcm1hdERhdGEpIDogZDMudGltZS5mb3JtYXQubXVsdGkodGlja0Zvcm1hdERhdGEpO1xuICBcdFx0XHQgIHZhciB4QXhpcyA9IGQzLnN2Zy5heGlzKClcbiAgXHRcdFx0XHQuc2NhbGUoeFNjYWxlKVxuICBcdFx0XHRcdC5vcmllbnQod2hlcmUpXG4gIFx0XHRcdFx0LnRpY2tGb3JtYXQodGlja0Zvcm1hdClcbiAgXHRcdFx0ICA7XG5cbiAgXHRcdFx0ICBpZiAodHlwZW9mIGNvbmZpZy5heGlzRm9ybWF0ID09PSAnZnVuY3Rpb24nKSB7XG4gIFx0XHRcdFx0Y29uZmlnLmF4aXNGb3JtYXQoeEF4aXMpO1xuICBcdFx0XHQgIH1cblxuICBcdFx0XHQgIHZhciB5ID0gKHdoZXJlID09ICdib3R0b20nID8gcGFyc2VJbnQoZ3JhcGhIZWlnaHQpIDogMCkgKyBjb25maWcubWFyZ2luLnRvcCAtIDQwO1xuXG4gIFx0XHRcdCAgZ3JhcGguc2VsZWN0KCcueC1heGlzLicgKyB3aGVyZSkucmVtb3ZlKCk7XG4gIFx0XHRcdCAgdmFyIHhBeGlzRWwgPSBncmFwaFxuICAgIFx0XHRcdFx0LmFwcGVuZCgnZycpXG4gICAgXHRcdFx0XHQuY2xhc3NlZCgneC1heGlzJywgdHJ1ZSlcbiAgICBcdFx0XHRcdC5jbGFzc2VkKHdoZXJlLCB0cnVlKVxuICAgIFx0XHRcdFx0LmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoJyArIGNvbmZpZy5tYXJnaW4ubGVmdCArICcsICcgKyB5ICsgJyknKVxuICAgIFx0XHRcdFx0LmNhbGwoeEF4aXMpXG4gIFx0XHRcdCAgO1xuICBcdFx0XHR9XG5cbiAgXHRcdFx0Ly8gaW5pdGlhbGl6YXRpb24gb2YgdGhlIGdyYXBoIGJvZHlcbiAgICAgICAgem9vbS5zaXplKFtjb25maWcud2lkdGgsIGhlaWdodF0pO1xuXG4gICAgICAgIGdyYXBoLnNlbGVjdCgnLmdyYXBoLWJvZHknKS5yZW1vdmUoKTtcbiAgICAgICAgdmFyIGdyYXBoQm9keSA9IGdyYXBoXG4gICAgICAgICAgLmFwcGVuZCgnZycpXG4gICAgICAgICAgLmNsYXNzZWQoJ2dyYXBoLWJvZHknLCB0cnVlKVxuICAgICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCcgKyBjb25maWcubWFyZ2luLmxlZnQgKyAnLCAnICsgKGNvbmZpZy5tYXJnaW4udG9wIC0gMTUpICsgJyknKTtcblxuICAgICAgICB2YXIgbGluZXMgPSBncmFwaEJvZHkuc2VsZWN0QWxsKCdnJykuZGF0YShkYXRhKTtcblxuICAgICAgICBsaW5lcy5lbnRlcigpXG4gICAgICAgICAgLmFwcGVuZCgnZycpXG4gICAgICAgICAgLmNsYXNzZWQoJ2xpbmUnLCB0cnVlKVxuICAgICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCBmdW5jdGlvbihkKSB7XG4gICAgICAgICAgICByZXR1cm4gJ3RyYW5zbGF0ZSgwLCcgKyB5U2NhbGUoZC5uYW1lKSArICcpJztcbiAgICAgICAgICB9KVxuICAgICAgICAgIC5zdHlsZSgnZmlsbCcsIGNvbmZpZy5ldmVudExpbmVDb2xvcilcbiAgICAgICAgICAuY2FsbChldmVudExpbmUoeyB4U2NhbGU6IHhTY2FsZSwgZXZlbnRDb2xvcjogY29uZmlnLmV2ZW50Q29sb3IgfSkpXG4gICAgICAgIDtcblxuICAgICAgICBsaW5lcy5leGl0KCkucmVtb3ZlKCk7XG5cbiAgICAgICAgZnVuY3Rpb24gcmVkcmF3KCkge1xuICAgICAgICAgIC8vIFN0b3JlIHRoZSBjdXJyZW50IHRyYW5zZm9ybWF0aW9uIG1hdHJpeFxuICAgICAgICAgIGN0eC5zYXZlKCk7XG4gICAgICAgICAgLy8gU2V0IGJhY2sgdG8gdGhlIG9yaWdpbmFsIGNhbnZhc1xuICAgICAgICAgIGN0eC5zZXRUcmFuc2Zvcm0oMSwgMCwgMCwgMSwgMCwgMCk7XG4gICAgICAgICAgLy8gQ2xlYXIgdGhlIGNhbnZhc1xuICAgICAgICAgIGN0eC5jbGVhclJlY3QoMCwgMCwgZ3JhcGhXaWR0aCwgZ3JhcGhIZWlnaHQpO1xuICAgICAgICAgIC8vIFJlc3RvcmUgdGhlIGZvcm1lciBjb29yZGluYXRlc1xuICAgICAgICAgIGN0eC5yZXN0b3JlKCk7XG5cbiAgICAgICAgICB2YXIgaGFzVG9wQXhpcyA9IHR5cGVvZiBjb25maWcuaGFzVG9wQXhpcyA9PT0gJ2Z1bmN0aW9uJyA/IGNvbmZpZy5oYXNUb3BBeGlzKGRhdGEpIDogY29uZmlnLmhhc1RvcEF4aXM7XG4gICAgICAgICAgaWYgKGhhc1RvcEF4aXMpIHtcbiAgICAgICAgICAgIHhBeGlzVG9wLmRyYXdYQXhpcygpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHZhciBoYXNCb3R0b21BeGlzID0gdHlwZW9mIGNvbmZpZy5oYXNCb3R0b21BeGlzID09PSAnZnVuY3Rpb24nID8gY29uZmlnLmhhc0JvdHRvbUF4aXMoZGF0YSkgOiBjb25maWcuaGFzQm90dG9tQXhpcztcbiAgICAgICAgICBpZiAoaGFzQm90dG9tQXhpcykge1xuICAgICAgICAgICAgeEF4aXNCb3R0b20uZHJhd1hBeGlzKCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbGluZXMuY2FsbChldmVudExpbmUoeyB4U2NhbGU6IHhTY2FsZSwgeVNjYWxlOiB5U2NhbGUsIGV2ZW50TGluZUNvbG9yOiBjb25maWcuZXZlbnRMaW5lQ29sb3IsIGV2ZW50Q29sb3I6IGNvbmZpZy5ldmVudENvbG9yIH0pKTtcblxuICAgICAgICAgIHZhciBGaWx0ZXJzID0ge307XG4gICAgICAgICAgRmlsdGVycy5nZXRQaXhlbHMgPSBmdW5jdGlvbihjdHgpIHtcbiAgICAgICAgICAgIHJldHVybiBjdHguZ2V0SW1hZ2VEYXRhKDAsMCw4MDAsNjAwKTtcbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgRmlsdGVycy5maWx0ZXJJbWFnZSA9IGZ1bmN0aW9uKGZpbHRlciwgY3R4LCB2YXJfYXJncykge1xuICAgICAgICAgICAgdmFyIGFyZ3MgPSBbdGhpcy5nZXRQaXhlbHMoY3R4KV07XG4gICAgICAgICAgICBmb3IgKHZhciBpPTI7IGk8YXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgIGFyZ3MucHVzaChhcmd1bWVudHNbaV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZpbHRlci5hcHBseShudWxsLCBhcmdzKTtcbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgRmlsdGVycy5jcmVhdGVJbWFnZURhdGEgPSBmdW5jdGlvbih3LGgpIHtcbiAgICAgICAgICAgIHJldHVybiBjdHguY3JlYXRlSW1hZ2VEYXRhKHcsaCk7XG4gICAgICAgICAgfTtcblxuICAgICAgICAgIEZpbHRlcnMuY29udm9sdXRlID0gZnVuY3Rpb24ocGl4ZWxzLCB3ZWlnaHRzLCBvcGFxdWUpIHtcbiAgICAgICAgICAgIHZhciBzaWRlID0gTWF0aC5yb3VuZChNYXRoLnNxcnQod2VpZ2h0cy5sZW5ndGgpKTtcbiAgICAgICAgICAgIHZhciBoYWxmU2lkZSA9IE1hdGguZmxvb3Ioc2lkZS8yKTtcbiAgICAgICAgICAgIHZhciBzcmMgPSBwaXhlbHMuZGF0YTtcbiAgICAgICAgICAgIHZhciBzdyA9IHBpeGVscy53aWR0aDtcbiAgICAgICAgICAgIHZhciBzaCA9IHBpeGVscy5oZWlnaHQ7XG4gICAgICAgICAgICAvLyBwYWQgb3V0cHV0IGJ5IHRoZSBjb252b2x1dGlvbiBtYXRyaXhcbiAgICAgICAgICAgIHZhciB3ID0gc3c7XG4gICAgICAgICAgICB2YXIgaCA9IHNoO1xuICAgICAgICAgICAgdmFyIG91dHB1dCA9IEZpbHRlcnMuY3JlYXRlSW1hZ2VEYXRhKDgwMCwgNjAwKTtcbiAgICAgICAgICAgIHZhciBkc3QgPSBvdXRwdXQuZGF0YTtcbiAgICAgICAgICAgIC8vIGdvIHRocm91Z2ggdGhlIGRlc3RpbmF0aW9uIGltYWdlIHBpeGVsc1xuICAgICAgICAgICAgZm9yICh2YXIgeT0wOyB5PGg7IHkrKykge1xuICAgICAgICAgICAgICBmb3IgKHZhciB4PTA7IHg8dzsgeCsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIHN5ID0geTtcbiAgICAgICAgICAgICAgICB2YXIgc3ggPSB4O1xuICAgICAgICAgICAgICAgIHZhciBkc3RPZmYgPSAoeSp3K3gpKjQ7XG4gICAgICAgICAgICAgICAgLy8gY2FsY3VsYXRlIHRoZSB3ZWlnaGVkIHN1bSBvZiB0aGUgc291cmNlIGltYWdlIHBpeGVscyB0aGF0XG4gICAgICAgICAgICAgICAgLy8gZmFsbCB1bmRlciB0aGUgY29udm9sdXRpb24gbWF0cml4XG4gICAgICAgICAgICAgICAgdmFyIHI9MCwgZz0wLCBiPTAsIGE9MDtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBjeT0wOyBjeTxzaWRlOyBjeSsrKSB7XG4gICAgICAgICAgICAgICAgICBmb3IgKHZhciBjeD0wOyBjeDxzaWRlOyBjeCsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzY3kgPSBzeSArIGN5IC0gaGFsZlNpZGU7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzY3ggPSBzeCArIGN4IC0gaGFsZlNpZGU7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzY3kgPj0gMCAmJiBzY3kgPCBzaCAmJiBzY3ggPj0gMCAmJiBzY3ggPCBzdykge1xuICAgICAgICAgICAgICAgICAgICAgIHZhciBzcmNPZmYgPSAoc2N5KnN3K3NjeCkqNDtcbiAgICAgICAgICAgICAgICAgICAgICB2YXIgd3QgPSB3ZWlnaHRzW2N5KnNpZGUrY3hdO1xuICAgICAgICAgICAgICAgICAgICAgIHIgKz0gc3JjW3NyY09mZl0gKiB3dDtcbiAgICAgICAgICAgICAgICAgICAgICBnICs9IHNyY1tzcmNPZmYrMV0gKiB3dDtcbiAgICAgICAgICAgICAgICAgICAgICBiICs9IHNyY1tzcmNPZmYrMl0gKiB3dDtcbiAgICAgICAgICAgICAgICAgICAgICBhICs9IHNyY1tzcmNPZmYrM10gKiB3dDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBkc3RbZHN0T2ZmXSA9IHI7XG4gICAgICAgICAgICAgICAgZHN0W2RzdE9mZisxXSA9IGc7XG4gICAgICAgICAgICAgICAgZHN0W2RzdE9mZisyXSA9IGI7XG4gICAgICAgICAgICAgICAgZHN0W2RzdE9mZiszXSA9IGE7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBvdXRwdXQ7XG4gICAgICAgICAgfTtcblxuICAgICAgICAgIHZhciByZXN1bHQgPSBGaWx0ZXJzLmZpbHRlckltYWdlKEZpbHRlcnMuY29udm9sdXRlLCBjdHgsXG4gICAgICAgICAgICBbIDEvOSwgMS85LCAxLzksXG4gICAgICAgICAgICAgIDEvOSwgMS85LCAxLzksXG4gICAgICAgICAgICAgIDEvOSwgMS85LCAxLzkgXVxuICAgICAgICAgICk7XG5cbiAgICAgICAgICBjdHgucHV0SW1hZ2VEYXRhKHJlc3VsdCwgMCwgMCk7XG4gICAgICAgIH1cblxuICAgICAgICByZWRyYXcoKTtcbiAgICAgICAgaWYgKGNvbmZpZy5oYXNEZWxpbWl0ZXIpIHtcbiAgICAgICAgICByZWRyYXdEZWxpbWl0ZXIoeFNjYWxlKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY29uZmlnLmV2ZW50Wm9vbSkge1xuICAgICAgICAgIGNvbmZpZy5ldmVudFpvb20oeFNjYWxlKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICB9XG5cdGNvbmZpZ3VyYWJsZShldmVudERyb3BHcmFwaCwgY29uZmlnKTtcblx0cmV0dXJuIGV2ZW50RHJvcEdyYXBoO1xuICB9O1xufTtcbiIsIlwidXNlIHN0cmljdFwiO1xuLyogZ2xvYmFsIHJlcXVpcmUsIG1vZHVsZSwgZDMgKi9cblxudmFyIGNvbmZpZ3VyYWJsZSA9IHJlcXVpcmUoJy4vdXRpbC9jb25maWd1cmFibGUnKTtcbnZhciBmaWx0ZXJEYXRhID0gcmVxdWlyZSgnLi9maWx0ZXJEYXRhJyk7XG5cbnZhciBkZWZhdWx0Q29uZmlnID0ge1xuICB4U2NhbGU6IG51bGwsXG4gIHlTY2FsZTogbnVsbFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZDMsIGNvbnRleHQpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChjb25maWcpIHtcblxuICAgIGNvbmZpZyA9IGNvbmZpZyB8fCB7XG4gICAgICB4U2NhbGU6IG51bGwsXG4gICAgICB5U2NhbGU6IG51bGwsXG4gICAgICBldmVudExpbmVDb2xvcjogJ2JsYWNrJyxcbiAgICAgIHdpZHRoOiAwLFxuICAgICAgaGVpZ2h0OiAwXG4gICAgfTtcbiAgICBmb3IgKHZhciBrZXkgaW4gZGVmYXVsdENvbmZpZykge1xuICAgICAgY29uZmlnW2tleV0gPSBjb25maWdba2V5XSB8fCBkZWZhdWx0Q29uZmlnW2tleV07XG4gICAgfVxuXG4gICAgdmFyIGV2ZW50TGluZSA9IGZ1bmN0aW9uIGV2ZW50TGluZShzZWxlY3Rpb24pIHtcbiAgICAgIHNlbGVjdGlvbi5lYWNoKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgIGQzLnNlbGVjdCh0aGlzKS5zZWxlY3RBbGwoJ3RleHQnKS5yZW1vdmUoKTtcblxuICAgICAgICBkMy5zZWxlY3QodGhpcykuYXBwZW5kKCd0ZXh0JylcbiAgICAgICAgICAudGV4dChmdW5jdGlvbihkKSB7XG4gICAgICAgICAgICB2YXIgY291bnQgPSBmaWx0ZXJEYXRhKGQuZGF0ZXMsIGNvbmZpZy54U2NhbGUpLmxlbmd0aDtcbiAgICAgICAgICAgIHJldHVybiBkLm5hbWUgKyAoY291bnQgPiAwID8gJyAoJyArIGNvdW50ICsgJyknIDogJycpO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLmF0dHIoJ3RleHQtYW5jaG9yJywgJ2VuZCcpXG4gICAgICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoLTIwKScpXG4gICAgICAgICAgLnN0eWxlKCdmaWxsJywgJ2JsYWNrJylcbiAgICAgICAgO1xuXG4gICAgICAgIHZhciBkYXRhQ29udGFpbmVyID0gZDMuc2VsZWN0KFwiYm9keVwiKS5hcHBlbmQoJ2N1c3RvbScpO1xuXG4gICAgICAgIGZ1bmN0aW9uIGhleFRvUmdiKGhleCwgYWxwaGEpIHtcbiAgICAgICAgICB2YXIgcmVzdWx0ID0gL14jPyhbYS1mXFxkXXsyfSkoW2EtZlxcZF17Mn0pKFthLWZcXGRdezJ9KSQvaS5leGVjKGhleCk7XG4gICAgICAgICAgdmFyIHRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICBpZiAoIXRoaXMuYWxwaGEpIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBcInJnYihcIiArIHRoaXMuciArIFwiLCBcIiArIHRoaXMuZyArIFwiLCBcIiArIHRoaXMuYiArIFwiKVwiO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGlmICh0aGlzLmFscGhhID4gMSkge1xuICAgICAgICAgICAgICAgICAgdGhpcy5hbHBoYSA9IDE7XG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5hbHBoYSA8IDApIHtcbiAgICAgICAgICAgICAgICAgIHRoaXMuYWxwaGEgPSAwO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJldHVybiBcInJnYmEoXCIgKyB0aGlzLnIgKyBcIiwgXCIgKyB0aGlzLmcgKyBcIiwgXCIgKyB0aGlzLmIgKyBcIiwgXCIgKyB0aGlzLmFscGhhICsgXCIpXCI7XG4gICAgICAgICAgfTtcbiAgICAgICAgICBpZiAoIWFscGhhKSB7XG4gICAgICAgICAgICAgIHJldHVybiByZXN1bHQgPyB7XG4gICAgICAgICAgICAgICAgICByOiBwYXJzZUludChyZXN1bHRbMV0sIDE2KSxcbiAgICAgICAgICAgICAgICAgIGc6IHBhcnNlSW50KHJlc3VsdFsyXSwgMTYpLFxuICAgICAgICAgICAgICAgICAgYjogcGFyc2VJbnQocmVzdWx0WzNdLCAxNiksXG4gICAgICAgICAgICAgICAgICB0b1N0cmluZzogdG9TdHJpbmdcbiAgICAgICAgICAgICAgfSA6IG51bGw7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChhbHBoYSA+IDEpIHtcbiAgICAgICAgICAgICAgYWxwaGEgPSAxO1xuICAgICAgICAgIH0gZWxzZSBpZiAoYWxwaGEgPCAwKSB7XG4gICAgICAgICAgICAgIGFscGhhID0gMDtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHJlc3VsdCA/IHtcbiAgICAgICAgICAgICAgcjogcGFyc2VJbnQocmVzdWx0WzFdLCAxNiksXG4gICAgICAgICAgICAgIGc6IHBhcnNlSW50KHJlc3VsdFsyXSwgMTYpLFxuICAgICAgICAgICAgICBiOiBwYXJzZUludChyZXN1bHRbM10sIDE2KSxcbiAgICAgICAgICAgICAgYWxwaGE6IGFscGhhLFxuICAgICAgICAgICAgICB0b1N0cmluZzogdG9TdHJpbmdcbiAgICAgICAgICB9IDogbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGRyYXdDdXN0b20gKGRhdGEpIHtcbiAgICAgICAgICB2YXIgZGF0ZXMgPSBmaWx0ZXJEYXRhKGRhdGEuZGF0ZXMsIGNvbmZpZy54U2NhbGUpO1xuICAgICAgICAgIHZhciB5ID0gMDtcbiAgICAgICAgICBpZiAodHlwZW9mIGNvbmZpZy55U2NhbGUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHkgPSBjb25maWcueVNjYWxlKGRhdGEubmFtZSkgKyAyNTtcbiAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHkgPSBjb25maWcueVNjYWxlICsgMjU7XG4gICAgICAgICAgfVxuICAgICAgICAgIHZhciBjb2xvciA9ICdibGFjayc7XG4gICAgICAgICAgaWYgKGNvbmZpZy5ldmVudExpbmVDb2xvcikge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBjb25maWcuZXZlbnRMaW5lQ29sb3IgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgY29sb3IgPSBjb25maWcuZXZlbnRMaW5lQ29sb3IoZGF0YSwgZGF0YS5uYW1lKTtcbiAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICBjb2xvciA9IGNvbmZpZy5ldmVudExpbmVDb2xvcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICB2YXIgZGF0ZVRhYiA9IGRhdGVzLnNvcnQoZnVuY3Rpb24oYSwgYikge1xuICAgICAgICAgICAgcmV0dXJuIGEgLSBiO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgdmFyIHBvaW50cyA9IFtdO1xuICAgICAgICAgIHZhciBpbmRleCA9IDA7XG5cbiAgICAgICAgICB2YXIgY29sb3JzID0gaGV4VG9SZ2IoY29sb3IsIDEpO1xuXG4gICAgICAgICAgaWYgKGNvbnRleHQpIHtcbiAgICAgICAgICAgIGRyYXdMaW5lKGRhdGVUYWIsIHksIGNvbG9ycywgY29udGV4dCwgcG9pbnRzKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBkcmF3TGluZShkYXRlcywgY29vclksIGNvbG9ycywgY29udGV4dCwgcG9pbnRzKSB7XG4gICAgICAgICAgZGF0ZXMuZm9yRWFjaChmdW5jdGlvbihkYXRlKSB7XG4gICAgICAgICAgICB2YXIgeCA9IGNvbmZpZy54U2NhbGUoZGF0ZSksXG4gICAgICAgICAgICAgICAgeSA9IGNvb3JZLFxuICAgICAgICAgICAgICAgIHNpemUgPSAxNTtcblxuICAgICAgICAgICAgICAgIHBvaW50cy5wdXNoKHt4OngseTp5LHNpemU6c2l6ZX0pO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgZnVuY3Rpb24gdXBkYXRlKCkge1xuICAgICAgICAgICAgdmFyIGxlbiA9IHBvaW50cy5sZW5ndGg7XG4gICAgICAgICAgICB3aGlsZSAobGVuLS0pIHtcbiAgICAgICAgICAgICAgdmFyIHBvaW50ID0gcG9pbnRzW2xlbl07XG5cbiAgICAgICAgICAgICAgY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICAgICAgICAgICAgdmFyIGdyYWQgPSBjb250ZXh0LmNyZWF0ZVJhZGlhbEdyYWRpZW50KHBvaW50LngsIHBvaW50LnksIDEsIHBvaW50LngsIHBvaW50LnksIHBvaW50LnNpemUpO1xuICAgICAgICAgICAgICBpZiAoY29sb3JzKSB7XG4gICAgICAgICAgICAgICAgZ3JhZC5hZGRDb2xvclN0b3AoMCwgJ3JnYmEoJyArIGNvbG9ycy5yICsnLCcgKyBjb2xvcnMuZyArICcsJyArIGNvbG9ycy5iICsgJywxKScpO1xuICAgICAgICAgICAgICAgIGdyYWQuYWRkQ29sb3JTdG9wKDEsICdyZ2JhKCcgKyBjb2xvcnMuciArJywnICsgY29sb3JzLmcgKyAnLCcgKyBjb2xvcnMuYiArICcsMCknKTtcbiAgICAgICAgICAgICAgICBjb250ZXh0LmZpbGxTdHlsZSA9IGdyYWQ7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgY29udGV4dC5hcmMocG9pbnQueCwgcG9pbnQueSwgcG9pbnQuc2l6ZSwgMCwgTWF0aC5QSSoyKTtcbiAgICAgICAgICAgICAgY29udGV4dC5maWxsKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBtZXRhYmFsaXplKCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgZnVuY3Rpb24gbWV0YWJhbGl6ZSgpIHtcbiAgICAgICAgICAgIHZhciB0aHJlc2hvbGQgPSAxODA7XG4gICAgICAgICAgICB2YXIgaW1hZ2VEYXRhID0gY29udGV4dC5nZXRJbWFnZURhdGEoMCwwLGNvbmZpZy53aWR0aCxjb25maWcuaGVpZ2h0KSxcbiAgICAgICAgICAgIHBpeCA9IGltYWdlRGF0YS5kYXRhO1xuXG4gICAgICAgICAgICB2YXIgYWxwaGE7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbiA9IHBpeC5sZW5ndGg7IGkgPCBuOyBpICs9IDQpIHtcbiAgICAgICAgICAgICAgICBhbHBoYSA9IHBpeFtpKzNdO1xuICAgICAgICAgICAgICAgIGlmKGFscGhhIDwgdGhyZXNob2xkKXtcbiAgICAgICAgICAgICAgICAgICAgYWxwaGEgPSAwO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBwaXhbaSArIDNdID0gYWxwaGEgPT09IDAgPyAwIDogMjU1O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb250ZXh0LnB1dEltYWdlRGF0YShpbWFnZURhdGEsIDAsIDApO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHVwZGF0ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgZHJhd0N1c3RvbShkYXRhKTtcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICBjb25maWd1cmFibGUoZXZlbnRMaW5lLCBjb25maWcpO1xuXG4gICAgcmV0dXJuIGV2ZW50TGluZTtcbiAgfTtcbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcbi8qIGdsb2JhbCBtb2R1bGUgKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBmaWx0ZXJEYXRlKGRhdGEsIHNjYWxlKSB7XG4gIGRhdGEgPSBkYXRhIHx8IFtdO1xuICB2YXIgYm91bmRhcnkgPSBzY2FsZS5yYW5nZSgpO1xuICB2YXIgbWluID0gYm91bmRhcnlbMF07XG4gIHZhciBtYXggPSBib3VuZGFyeVsxXTtcblxuICByZXR1cm4gZGF0YS5maWx0ZXIoZnVuY3Rpb24gKGRhdHVtKSB7XG4gICAgdmFyIHZhbHVlID0gc2NhbGUoZGF0dW0pO1xuICAgIHJldHVybiAhKHZhbHVlIDwgbWluIHx8IHZhbHVlID4gbWF4KTtcbiAgfSk7XG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vKiBnbG9iYWwgcmVxdWlyZSwgZGVmaW5lLCBtb2R1bGUgKi9cblxudmFyIGV2ZW50RHJvcHMgPSByZXF1aXJlKCcuL2V2ZW50RHJvcHMnKTtcblxuaWYgKHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kKSB7XG4gIGRlZmluZSgnZDMuY2hhcnQuZXZlbnREcm9wcycsIFtcImQzXCJdLCBmdW5jdGlvbiAoZDMpIHtcbiAgICBkMy5jaGFydCA9IGQzLmNoYXJ0IHx8IHt9O1xuICAgIGQzLmNoYXJ0LmV2ZW50RHJvcHMgPSBldmVudERyb3BzKGQzLCBkb2N1bWVudCk7XG4gIH0pO1xufSBlbHNlIGlmICh3aW5kb3cpIHtcbiAgd2luZG93LmQzLmNoYXJ0ID0gd2luZG93LmQzLmNoYXJ0IHx8IHt9O1xuICB3aW5kb3cuZDMuY2hhcnQuZXZlbnREcm9wcyA9IGV2ZW50RHJvcHMod2luZG93LmQzLCBkb2N1bWVudCk7XG59IGVsc2Uge1xuICBtb2R1bGUuZXhwb3J0cyA9IGV2ZW50RHJvcHM7XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNvbmZpZ3VyYWJsZSh0YXJnZXRGdW5jdGlvbiwgY29uZmlnLCBsaXN0ZW5lcnMpIHtcbiAgbGlzdGVuZXJzID0gbGlzdGVuZXJzIHx8IHt9O1xuICBmb3IgKHZhciBpdGVtIGluIGNvbmZpZykge1xuICAgIChmdW5jdGlvbihpdGVtKSB7XG4gICAgICB0YXJnZXRGdW5jdGlvbltpdGVtXSA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIGNvbmZpZ1tpdGVtXTtcbiAgICAgICAgY29uZmlnW2l0ZW1dID0gdmFsdWU7XG4gICAgICAgIGlmIChsaXN0ZW5lcnMuaGFzT3duUHJvcGVydHkoaXRlbSkpIHtcbiAgICAgICAgICBsaXN0ZW5lcnNbaXRlbV0odmFsdWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRhcmdldEZ1bmN0aW9uO1xuICAgICAgfTtcbiAgICB9KShpdGVtKTsgLy8gZm9yIGRvZXNuJ3QgY3JlYXRlIGEgY2xvc3VyZSwgZm9yY2luZyBpdFxuICB9XG59O1xuIiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGQzLCBjb25maWcsIHhTY2FsZSwgZ3JhcGgsIGdyYXBoSGVpZ2h0LCB3aGVyZSkge1xuICB2YXIgeEF4aXMgPSB7fTtcbiAgdmFyIHhBeGlzRWxzID0ge307XG5cbiAgdmFyIHRpY2tGb3JtYXREYXRhID0gW107XG5cbiAgY29uZmlnLnRpY2tGb3JtYXQuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSkge1xuICAgIHZhciB0aWNrID0gaXRlbS5zbGljZSgwKTtcbiAgICB0aWNrRm9ybWF0RGF0YS5wdXNoKHRpY2spO1xuICB9KTtcblxuICB2YXIgdGlja0Zvcm1hdCA9IGNvbmZpZy5sb2NhbGUgPyBjb25maWcubG9jYWxlLnRpbWVGb3JtYXQubXVsdGkodGlja0Zvcm1hdERhdGEpIDogZDMudGltZS5mb3JtYXQubXVsdGkodGlja0Zvcm1hdERhdGEpO1xuICB4QXhpc1t3aGVyZV0gPSBkMy5zdmcuYXhpcygpXG4gICAgLnNjYWxlKHhTY2FsZSlcbiAgICAub3JpZW50KHdoZXJlKVxuICAgIC50aWNrRm9ybWF0KHRpY2tGb3JtYXQpXG4gIDtcblxuICBpZiAodHlwZW9mIGNvbmZpZy5heGlzRm9ybWF0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgY29uZmlnLmF4aXNGb3JtYXQoeEF4aXMpO1xuICB9XG5cbiAgdmFyIHkgPSAod2hlcmUgPT0gJ2JvdHRvbScgPyBwYXJzZUludChncmFwaEhlaWdodCkgOiAwKSArIGNvbmZpZy5tYXJnaW4udG9wIC0gNDA7XG5cbiAgeEF4aXNFbHNbd2hlcmVdID0gZ3JhcGhcbiAgICAuYXBwZW5kKCdnJylcbiAgICAuY2xhc3NlZCgneC1heGlzJywgdHJ1ZSlcbiAgICAuY2xhc3NlZCh3aGVyZSwgdHJ1ZSlcbiAgICAuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgnICsgY29uZmlnLm1hcmdpbi5sZWZ0ICsgJywgJyArIHkgKyAnKScpXG4gICAgLmNhbGwoeEF4aXNbd2hlcmVdKVxuICA7XG5cbiAgdmFyIGRyYXdYQXhpcyA9IGZ1bmN0aW9uIGRyYXdYQXhpcygpIHtcbiAgICB4QXhpc0Vsc1t3aGVyZV1cbiAgICAgIC5jYWxsKHhBeGlzW3doZXJlXSlcbiAgICA7XG4gIH07XG5cbiAgcmV0dXJuIHtcbiAgICBkcmF3WEF4aXM6IGRyYXdYQXhpc1xuICB9O1xufTtcbiJdfQ==
