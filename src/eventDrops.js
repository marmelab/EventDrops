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

          if (context) {
            drawLine(dates, y, color, context);
          }
        }

        function drawLine(dates, y, color, context) {
          dates.forEach(function(date) {
            context.beginPath();
            context.fillStyle = color;
            context.arc(config.xScale(date), y, 10, 0, 2 * Math.PI);
            context.fill();
            context.closePath();
          });
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwibGliL2NhbnZhc0hhbmRsZXIuanMiLCJsaWIvZGVsaW1pdGVyLmpzIiwibGliL2V2ZW50RHJvcHMuanMiLCJsaWIvZXZlbnRMaW5lLmpzIiwibGliL2ZpbHRlckRhdGEuanMiLCJsaWIvbWFpbi5qcyIsImxpYi91dGlsL2NvbmZpZ3VyYWJsZS5qcyIsImxpYi94QXhpcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2VEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcInVzZSBzdHJpY3RcIjtcbi8qIGdsb2JhbCByZXF1aXJlLCBtb2R1bGUgKi9cblxudmFyIGRlZmF1bHRDb25maWcgPSB7XG4gIHhTY2FsZTogbnVsbFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZDMsIGRvY3VtZW50LCBjb25maWcpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChjb25maWcpIHtcblxuICAgIGNvbmZpZyA9IGNvbmZpZyB8fCB7XG4gICAgICB4U2NhbGU6IG51bGwsXG4gICAgICBldmVudENvbG9yOiBudWxsXG4gICAgfTtcbiAgICBmb3IgKHZhciBrZXkgaW4gZGVmYXVsdENvbmZpZykge1xuICAgICBjb25maWdba2V5XSA9IGNvbmZpZ1trZXldIHx8IGRlZmF1bHRDb25maWdba2V5XTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjYW52YXNIYW5kbGVyKHgsIHkpIHtcbiAgICAgIHRoaXMuZ3JhcGhXaWR0aCA9IHg7XG4gICAgICB0aGlzLmdyYXBoSGVpZ2h0ID0geTtcbiAgICAgIHRoaXMubGFzdFggPSBncmFwaFdpZHRoLzI7XG4gICAgICB0aGlzLmxhc3RZID0gZ3JhcGhIZWlnaHQvMjtcbiAgICAgIHRoaXMubW91c2VEb3duID0gMDtcbiAgICAgIHRoaXMuY3R4ID0gbnVsbDtcbiAgICAgIHRoaXMuY2FudmFzID0gbnVsbDtcbiAgICB9XG5cbiAgICAvKnZhciBncmFwaEhlaWdodCwgZ3JhcGhXaWR0aDtcbiAgICB2YXIgbGFzdFgsIGxhc3RZO1xuICAgIHZhciBjdHg7XG4gICAgdmFyIG1vdXNlRG93biA9IDA7XG4gICAgdmFyIGRyYWdTdGFydCwgZHJhZ2dlZDsqL1xuXG4gICAgLyp2YXIgY2FudmFzSGFuZGxlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBncmFwaFdpZHRoID0gY29uZmlnLndpZHRoIC0gY29uZmlnLm1hcmdpbi5yaWdodCAtIGNvbmZpZy5tYXJnaW4ubGVmdDtcbiAgICAgIGFsZXJ0KGdyYXBoV2lkdGgpO1xuICAgICAgdmFyIGdyYXBoSGVpZ2h0ID0gZGF0YS5sZW5ndGggKiA0MDtcbiAgICAgIGFsZXJ0KGdyYXBoSGVpZ2h0KTtcbiAgICAgIHZhciBjdHggPSAoY2FudmFzLm5vZGUoKSkuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICAgIHZhciBtb3VzZURvd24gPSAwO1xuICAgICAgdmFyIGxhc3RYID0gZ3JhcGhXaWR0aC8yO1xuICAgICAgdmFyIGxhc3RZID0gZ3JhcGhIZWlnaHQvMjtcbiAgICB9Ki9cblxuICAgICAgdGhpcy5pbml0ID0gZnVuY3Rpb24gKHNlbGVjdGlvbiwgeCwgeSkge1xuICAgICAgICAvKnRoaXMuZ3JhcGhXaWR0aCA9IHg7XG4gICAgICAgIHRoaXMuZ3JhcGhIZWlnaHQgPSB5O1xuICAgICAgICB0aGlzLm1vdXNlRG93biA9IDA7XG4gICAgICAgIHRoaXMubGFzdFggPSB4LzI7XG4gICAgICAgIHRoaXMubGFzdFkgPSB5LzI7Ki9cblxuICAgICAgICBzZWxlY3Rpb24uZWFjaChmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgIGQzLnNlbGVjdCh0aGlzKS5zZWxlY3QoJ2NhbnZhcycpLnJlbW92ZSgpO1xuICAgICAgICAgIHZhciBjYW52YXMgPSBkMy5zZWxlY3QodGhpcylcbiAgICAgICAgICAgIC5hcHBlbmQoJ2NhbnZhcycpXG4gICAgICAgICAgICAuYXR0cignaWQnLCBcIm1vbl9jYW52YXNcIilcbiAgICAgICAgICAgIC5hdHRyKCd3aWR0aCcsIHRoaXMuZ3JhcGhXaWR0aClcbiAgICAgICAgICAgIC5hdHRyKCdoZWlnaHQnLCB0aGlzLmdyYXBoSGVpZ2h0KVxuICAgICAgICAgICAgO1xuICAgICAgICAgIHRoaXMuY3R4ID0gY2FudmFzLm5vZGUoKS5nZXRDb250ZXh0KCcyZCcpO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5kcmF3ID0gZnVuY3Rpb24oKXtcbiAgICAgICAgLy8gQ2xlYXIgdGhlIGVudGlyZSBjYW52YXNcbiAgICAgICAgdmFyIHRvcFggPSAwO1xuICAgICAgICB2YXIgdG9wWSA9IDA7XG4gICAgICAgIC8vYWxlcnQoZ3JhcGhXaWR0aCk7XG4gICAgICAgIHRoaXMuY3R4LmNsZWFyUmVjdCh0b3BYLCB0b3BZLCB0b3BYICsgZ3JhcGhXaWR0aCwgdG9wWSArIGdyYXBoSGVpZ2h0KTtcblxuICAgICAgICBjdHguZm9udCA9IFwiMzBweCBBcmlhbFwiO1xuICAgICAgICBjdHgudGV4dEFsaWduID0gXCJjZW50ZXJcIjtcbiAgICAgICAgY3R4LmZpbGxUZXh0KFwiVG90b1wiLDc1MC8yLDM1KTtcbiAgICAgICAgY3R4LmZpbGxUZXh0KFwiVG90b1wiLDc1MC8yLDc1KTtcbiAgICAgICAgY3R4LmZpbGxUZXh0KFwiVG90b1wiLDc1MC8yLDExNSk7XG4gICAgICAgIGN0eC5maWxsVGV4dChcIlRvdG9cIiw3NTAvMiwxNTUpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmRyYXdDaXJjbGUgPSBmdW5jdGlvbiAoeCwgeSkge1xuICAgICAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgICAgICBjb250ZXh0LmxpbmVXaWR0aD1cIjJcIjtcbiAgICAgICAgY29udGV4dC5maWxsU3R5bGU9XCIjRkY0NDIyXCI7XG4gICAgICAgIGNvbnRleHQuYXJjKHgsIHksIDkwLCAwLCAyICogTWF0aC5QSSk7XG4gICAgICAgIGNvbnRleHQuZmlsbCgpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLm1vdXNlRG93bkhhbmRsZXIgPSBmdW5jdGlvbihldnQpe1xuICAgICAgICAvLyBwZXJtaXRzIGNvbXBhdGliaWxpdHkgd2l0aCBldmVyeSBicm93c2VyXG4gICAgICAgIGRvY3VtZW50LmJvZHkuc3R5bGUubW96VXNlclNlbGVjdCA9IGRvY3VtZW50LmJvZHkuc3R5bGUud2Via2l0VXNlclNlbGVjdCA9IGRvY3VtZW50LmJvZHkuc3R5bGUudXNlclNlbGVjdCA9ICdub25lJztcbiAgICAgICAgLy9sYXN0WCA9IGV2dC5vZmZzZXRYIHx8IChldnQucGFnZVggLSBjYW52YXMubm9kZSgpLm9mZnNldExlZnQpO1xuICAgICAgICBsYXN0WCA9IGV2dC5jbGllbnRYO1xuICAgICAgICAvL2xhc3RZID0gZ3JhcGhIZWlnaHQvMjtcbiAgICAgICAgLy9hbGVydChsYXN0WCk7XG4gICAgICAgIHZhciBkcmFnU3RhcnQgPSB7XG4gICAgICAgICAgeCA6IGxhc3RYLFxuICAgICAgICAgIHkgOiBsYXN0WVxuICAgICAgICB9O1xuICAgICAgICB2YXIgZHJhZ2dlZCA9IGZhbHNlO1xuICAgICAgICBtb3VzZURvd24rKztcblxuICAgICAgICAvL2NhbnZhcy5ub2RlKCkuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgYy5tb3VzZU1vdmVIYW5kbGVyLGZhbHNlKTtcbiAgICAgICAgLy9jYW52YXMubm9kZSgpLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBjLm1vdXNlVXBIYW5kbGVyLGZhbHNlKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5tb3VzZU1vdmVIYW5kbGVyID0gZnVuY3Rpb24oZXZ0KXtcbiAgICAgICAgLy9sYXN0WCA9IGV2dC5vZmZzZXRYIHx8IChldnQucGFnZVggLSBjYW52YXMubm9kZSgpLm9mZnNldExlZnQpO1xuICAgICAgICBsYXN0WCA9IGV2dC5jbGllbnRYO1xuICAgICAgICBkcmFnZ2VkID0gdHJ1ZTtcbiAgICAgICAgaWYgKGRyYWdTdGFydCAmJiBtb3VzZURvd24pe1xuICAgICAgICAgIGN0eC50cmFuc2xhdGUobGFzdFgtZHJhZ1N0YXJ0LngsIGxhc3RZLWRyYWdTdGFydC55KTtcbiAgICAgICAgICAvL2N0eC50cmFuc2xhdGUoW2QzLmV2ZW50LnRyYW5zbGF0ZVswXSwgMF0pO1xuICAgICAgICAgIGRyYXdBZ2FpbigpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMubW91c2VVcEhhbmRsZXIgPSBmdW5jdGlvbihldnQpe1xuICAgICAgICAvL2NhbnZhcy5ub2RlKCkuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgYy5tb3VzZU1vdmVIYW5kbGVyLGZhbHNlKTtcbiAgICAgICAgLy9jYW52YXMubm9kZSgpLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIGMubW91c2VEb3duSGFuZGxlcixmYWxzZSk7XG5cbiAgICAgICAgZHJhZ1N0YXJ0ID0gbnVsbDtcbiAgICAgICAgbW91c2VEb3duLS07XG4gICAgICAgIGlmICghZHJhZ2dlZCkgem9vbShldnQuc2hpZnRLZXkgPyAtMSA6IDEgKTtcbiAgICAgIH1cbiAgfVxufVxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vKiBnbG9iYWwgcmVxdWlyZSwgbW9kdWxlLCBkMyAqL1xuXG52YXIgY29uZmlndXJhYmxlID0gcmVxdWlyZSgnLi91dGlsL2NvbmZpZ3VyYWJsZScpO1xuXG52YXIgZGVmYXVsdENvbmZpZyA9IHtcbiAgeFNjYWxlOiBudWxsLFxuICBkYXRlRm9ybWF0OiBudWxsXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChkMykge1xuXG4gIHJldHVybiBmdW5jdGlvbiAoY29uZmlnKSB7XG5cbiAgICBjb25maWcgPSBjb25maWcgfHwge307XG4gICAgZm9yICh2YXIga2V5IGluIGRlZmF1bHRDb25maWcpIHtcbiAgICAgIGNvbmZpZ1trZXldID0gY29uZmlnW2tleV0gfHwgZGVmYXVsdENvbmZpZ1trZXldO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGRlbGltaXRlcihzZWxlY3Rpb24pIHtcbiAgICAgIHNlbGVjdGlvbi5lYWNoKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgIGQzLnNlbGVjdCh0aGlzKS5zZWxlY3RBbGwoJ3RleHQnKS5yZW1vdmUoKTtcblxuICAgICAgICB2YXIgbGltaXRzID0gY29uZmlnLnhTY2FsZS5kb21haW4oKTtcblxuICAgICAgICBkMy5zZWxlY3QodGhpcykuYXBwZW5kKCd0ZXh0JylcbiAgICAgICAgICAudGV4dChmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgIHJldHVybiBjb25maWcuZGF0ZUZvcm1hdChsaW1pdHNbMF0pO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLmNsYXNzZWQoJ3N0YXJ0JywgdHJ1ZSlcbiAgICAgICAgO1xuXG4gICAgICAgIGQzLnNlbGVjdCh0aGlzKS5hcHBlbmQoJ3RleHQnKVxuICAgICAgICAgIC50ZXh0KGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgcmV0dXJuIGNvbmZpZy5kYXRlRm9ybWF0KGxpbWl0c1sxXSk7XG4gICAgICAgICAgfSlcbiAgICAgICAgICAuYXR0cigndGV4dC1hbmNob3InLCAnZW5kJylcbiAgICAgICAgICAuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgnICsgY29uZmlnLnhTY2FsZS5yYW5nZSgpWzFdICsgJyknKVxuICAgICAgICAgIC5jbGFzc2VkKCdlbmQnLCB0cnVlKVxuICAgICAgICA7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBjb25maWd1cmFibGUoZGVsaW1pdGVyLCBjb25maWcpO1xuXG4gICAgcmV0dXJuIGRlbGltaXRlcjtcbiAgfTtcbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcbi8qIGdsb2JhbCByZXF1aXJlLCBtb2R1bGUgKi9cblxudmFyIGNvbmZpZ3VyYWJsZSA9IHJlcXVpcmUoJy4vdXRpbC9jb25maWd1cmFibGUnKTtcbnZhciB4QXhpc0ZhY3RvcnkgPSByZXF1aXJlKCcuL3hBeGlzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGQzLCBkb2N1bWVudCkge1xuICB2YXIgZGVsaW1pdGVyID0gcmVxdWlyZSgnLi9kZWxpbWl0ZXInKShkMyk7XG4gIHZhciBjYW52YXNIYW5kbGVyID0gcmVxdWlyZSgnLi9jYW52YXNIYW5kbGVyJykoZDMsIGRvY3VtZW50KTtcbiAgdmFyIGZpbHRlckRhdGEgPSByZXF1aXJlKCcuL2ZpbHRlckRhdGEnKTtcblxuICB2YXIgZGVmYXVsdENvbmZpZyA9IHtcblx0XHRzdGFydDogbmV3IERhdGUoMCksXG5cdFx0ZW5kOiBuZXcgRGF0ZSgpLFxuXHRcdG1pblNjYWxlOiAwLFxuXHRcdG1heFNjYWxlOiBJbmZpbml0eSxcblx0XHR3aWR0aDogMTAwMCxcblx0XHRtYXJnaW46IHtcblx0XHQgIHRvcDogNjAsXG5cdFx0ICBsZWZ0OiAyMDAsXG5cdFx0ICBib3R0b206IDQwLFxuXHRcdCAgcmlnaHQ6IDUwXG5cdFx0fSxcblx0XHRsb2NhbGU6IG51bGwsXG5cdFx0YXhpc0Zvcm1hdDogbnVsbCxcblx0XHR0aWNrRm9ybWF0OiBbXG5cdFx0XHRbXCIuJUxcIiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gZC5nZXRNaWxsaXNlY29uZHMoKTsgfV0sXG5cdFx0XHRbXCI6JVNcIiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gZC5nZXRTZWNvbmRzKCk7IH1dLFxuXHRcdFx0W1wiJUk6JU1cIiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gZC5nZXRNaW51dGVzKCk7IH1dLFxuXHRcdFx0W1wiJUkgJXBcIiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gZC5nZXRIb3VycygpOyB9XSxcblx0XHRcdFtcIiVhICVkXCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQuZ2V0RGF5KCkgJiYgZC5nZXREYXRlKCkgIT0gMTsgfV0sXG5cdFx0XHRbXCIlYiAlZFwiLCBmdW5jdGlvbihkKSB7IHJldHVybiBkLmdldERhdGUoKSAhPSAxOyB9XSxcblx0XHRcdFtcIiVCXCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQuZ2V0TW9udGgoKTsgfV0sXG5cdFx0XHRbXCIlWVwiLCBmdW5jdGlvbigpIHsgcmV0dXJuIHRydWU7IH1dXG5cdFx0XSxcblx0XHRldmVudEhvdmVyOiBudWxsLFxuXHRcdGV2ZW50Wm9vbTogbnVsbCxcblx0XHRldmVudENsaWNrOiBudWxsLFxuXHRcdGhhc0RlbGltaXRlcjogdHJ1ZSxcblx0XHRoYXNUb3BBeGlzOiB0cnVlLFxuXHRcdGhhc0JvdHRvbUF4aXM6IGZ1bmN0aW9uIChkYXRhKSB7XG5cdFx0ICByZXR1cm4gZGF0YS5sZW5ndGggPj0gMTA7XG5cdFx0fSxcblx0XHRldmVudExpbmVDb2xvcjogJ2JsYWNrJyxcblx0XHRldmVudENvbG9yOiBudWxsXG4gIH07XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIGV2ZW50RHJvcHMoY29uZmlnKSB7XG5cdFx0dmFyIHhTY2FsZSA9IGQzLnRpbWUuc2NhbGUoKTtcblx0XHR2YXIgeVNjYWxlID0gZDMuc2NhbGUub3JkaW5hbCgpO1xuXHRcdGNvbmZpZyA9IGNvbmZpZyB8fCB7fTtcblx0XHRmb3IgKHZhciBrZXkgaW4gZGVmYXVsdENvbmZpZykge1xuXHRcdCAgY29uZmlnW2tleV0gPSBjb25maWdba2V5XSB8fCBkZWZhdWx0Q29uZmlnW2tleV07XG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gZXZlbnREcm9wR3JhcGgoc2VsZWN0aW9uKSB7XG5cdFx0ICBzZWxlY3Rpb24uZWFjaChmdW5jdGlvbiAoZGF0YSkge1xuXHRcdFx0XHR2YXIgem9vbSA9IGQzLmJlaGF2aW9yLnpvb20oKS5jZW50ZXIobnVsbCkuc2NhbGVFeHRlbnQoW2NvbmZpZy5taW5TY2FsZSwgY29uZmlnLm1heFNjYWxlXSkub24oXCJ6b29tXCIsIHVwZGF0ZVpvb20pO1xuXG5cdFx0XHRcdHpvb20ub24oXCJ6b29tZW5kXCIsIHpvb21FbmQpO1xuXG4gICAgICAgIHZhciBncmFwaFdpZHRoID0gY29uZmlnLndpZHRoIC0gY29uZmlnLm1hcmdpbi5yaWdodCAtIGNvbmZpZy5tYXJnaW4ubGVmdDtcbiAgICAgICAgdmFyIGdyYXBoSGVpZ2h0ID0gZGF0YS5sZW5ndGggKiA0MDtcbiAgICAgICAgdmFyIGhlaWdodCA9IGdyYXBoSGVpZ2h0ICsgY29uZmlnLm1hcmdpbi50b3AgKyBjb25maWcubWFyZ2luLmJvdHRvbTtcbiAgICAgICAgdmFyIHhBeGlzVG9wLCB4QXhpc0JvdHRvbTtcblxuICAgICAgICB2YXIgY2FudmFzX3dpZHRoID0gZ3JhcGhXaWR0aDtcbiAgICAgICAgdmFyIGNhbnZhc19oZWlnaHQgPSBncmFwaEhlaWdodDtcblxuICAgICAgICB2YXIgbGFzdFggPSBncmFwaFdpZHRoLzI7XG4gICAgICAgIHZhciBsYXN0WSA9IGdyYXBoSGVpZ2h0LzI7XG4gICAgICAgIHZhciBkcmFnZ2VkLCBkcmFnU3RhcnQ7XG4gICAgICAgIHZhciBtb3VzZURvd24gPSAwO1xuXG4gICAgICAgIHZhciB0b3BYID0gMDtcbiAgICAgICAgdmFyIHRvcFkgPSAwO1xuXG4gICAgICAgIHZhciBiYXNlID0gZDMuc2VsZWN0KHRoaXMpO1xuXG4gICAgICAgIGQzLnNlbGVjdCh0aGlzKS5zZWxlY3QoJ2NhbnZhcycpLnJlbW92ZSgpO1xuICAgIFx0XHR2YXIgY2FudmFzID0gZDMuc2VsZWN0KHRoaXMpXG4gICAgXHRcdCAgLmFwcGVuZCgnY2FudmFzJylcbiAgICBcdFx0ICAuYXR0cignaWQnLCBcIm1vbl9jYW52YXNcIilcbiAgICBcdFx0ICAuYXR0cignd2lkdGgnLCBjYW52YXNfd2lkdGgpXG4gICAgXHRcdCAgLmF0dHIoJ2hlaWdodCcsIGNhbnZhc19oZWlnaHQpO1xuXG4gIFx0XHQgIHZhciBjdHggPSAoY2FudmFzLm5vZGUoKSkuZ2V0Q29udGV4dCgnMmQnKTtcblxuICAgICAgICB2YXIgZXZlbnRMaW5lID0gcmVxdWlyZSgnLi9ldmVudExpbmUnKShkMywgY3R4KTtcblxuICBcdFx0XHRkMy5zZWxlY3QodGhpcykuc2VsZWN0KCdzdmcnKS5yZW1vdmUoKTtcblxuICBcdFx0XHR2YXIgc3ZnID0gZDMuc2VsZWN0KHRoaXMpXG4gIFx0XHRcdCAgLmFwcGVuZCgnc3ZnJylcbiAgXHRcdFx0ICAuYXR0cignd2lkdGgnLCBjb25maWcud2lkdGgpXG4gIFx0XHRcdCAgLmF0dHIoJ2hlaWdodCcsIGhlaWdodClcbiAgXHRcdFx0O1xuXG4gIFx0XHRcdHZhciBncmFwaCA9IHN2Zy5hcHBlbmQoJ2cnKVxuICBcdFx0XHQgIC5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKDAsIDI1KScpO1xuXG4gIFx0XHRcdHZhciB5RG9tYWluID0gW107XG4gIFx0XHRcdHZhciB5UmFuZ2UgPSBbXTtcblxuICBcdFx0XHRkYXRhLmZvckVhY2goZnVuY3Rpb24gKGV2ZW50LCBpbmRleCkge1xuICBcdFx0XHQgIHlEb21haW4ucHVzaChldmVudC5uYW1lKTtcbiAgXHRcdFx0ICB5UmFuZ2UucHVzaChpbmRleCAqIDQwKTtcbiAgXHRcdFx0fSk7XG5cbiAgXHRcdFx0eVNjYWxlLmRvbWFpbih5RG9tYWluKS5yYW5nZSh5UmFuZ2UpO1xuXG5cbiAgXHRcdFx0dmFyIHlBeGlzRWwgPSBncmFwaC5hcHBlbmQoJ2cnKVxuICBcdFx0XHQgIC5jbGFzc2VkKCd5LWF4aXMnLCB0cnVlKVxuICBcdFx0XHQgIC5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKDAsIDYwKScpO1xuXG4gIFx0XHRcdHZhciB5VGljayA9IHlBeGlzRWwuYXBwZW5kKCdnJykuc2VsZWN0QWxsKCdnJykuZGF0YSh5RG9tYWluKTtcblxuICBcdFx0XHR5VGljay5lbnRlcigpXG4gIFx0XHRcdCAgLmFwcGVuZCgnZycpXG4gIFx0XHRcdCAgLmF0dHIoJ3RyYW5zZm9ybScsIGZ1bmN0aW9uKGQpIHtcbiAgXHRcdFx0XHRyZXR1cm4gJ3RyYW5zbGF0ZSgwLCAnICsgeVNjYWxlKGQpICsgJyknO1xuICBcdFx0XHQgIH0pXG4gIFx0XHRcdCAgLmFwcGVuZCgnbGluZScpXG4gIFx0XHRcdCAgLmNsYXNzZWQoJ3ktdGljaycsIHRydWUpXG4gIFx0XHRcdCAgLmF0dHIoJ3gxJywgY29uZmlnLm1hcmdpbi5sZWZ0KVxuICBcdFx0XHQgIC5hdHRyKCd4MicsIGNvbmZpZy5tYXJnaW4ubGVmdCArIGdyYXBoV2lkdGgpO1xuXG5cdFx0XHQgIHlUaWNrLmV4aXQoKS5yZW1vdmUoKTtcblxuICBcdFx0XHR2YXIgY3VyeCwgY3VyeTtcbiAgXHRcdFx0dmFyIHpvb21SZWN0ID0gc3ZnXG4gIFx0XHRcdCAgLmFwcGVuZCgncmVjdCcpXG4gIFx0XHRcdCAgLmNhbGwoem9vbSlcbiAgXHRcdFx0ICAuY2xhc3NlZCgnem9vbScsIHRydWUpXG4gIFx0XHRcdCAgLmF0dHIoJ3dpZHRoJywgZ3JhcGhXaWR0aClcbiAgXHRcdFx0ICAuYXR0cignaGVpZ2h0JywgaGVpZ2h0IClcbiAgXHRcdFx0ICAuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgnICsgY29uZmlnLm1hcmdpbi5sZWZ0ICsgJywgMzUpJylcbiAgXHRcdFx0O1xuXG4gIFx0XHRcdGlmICh0eXBlb2YgY29uZmlnLmV2ZW50SG92ZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgXHRcdFx0ICB6b29tUmVjdC5vbignbW91c2Vtb3ZlJywgZnVuY3Rpb24oZCwgZSkge1xuICBcdFx0XHRcdHZhciBldmVudCA9IGQzLmV2ZW50O1xuICBcdFx0XHRcdGlmIChjdXJ4ID09IGV2ZW50LmNsaWVudFggJiYgY3VyeSA9PSBldmVudC5jbGllbnRZKSByZXR1cm47XG4gIFx0XHRcdFx0Y3VyeCA9IGV2ZW50LmNsaWVudFg7XG4gIFx0XHRcdFx0Y3VyeSA9IGV2ZW50LmNsaWVudFk7XG4gIFx0XHRcdFx0em9vbVJlY3QuYXR0cignZGlzcGxheScsICdub25lJyk7XG4gIFx0XHRcdFx0dmFyIGVsID0gZG9jdW1lbnQuZWxlbWVudEZyb21Qb2ludChkMy5ldmVudC5jbGllbnRYLCBkMy5ldmVudC5jbGllbnRZKTtcbiAgXHRcdFx0XHR6b29tUmVjdC5hdHRyKCdkaXNwbGF5JywgJ2Jsb2NrJyk7XG4gIFx0XHRcdFx0aWYgKGVsLnRhZ05hbWUgIT09ICdjaXJjbGUnKSByZXR1cm47XG4gIFx0XHRcdFx0Y29uZmlnLmV2ZW50SG92ZXIoZWwpO1xuICBcdFx0XHQgIH0pO1xuICBcdFx0XHR9XG5cbiAgXHRcdFx0aWYgKHR5cGVvZiBjb25maWcuZXZlbnRDbGljayA9PT0gJ2Z1bmN0aW9uJykge1xuICBcdFx0XHQgIHpvb21SZWN0Lm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgXHRcdFx0XHR6b29tUmVjdC5hdHRyKCdkaXNwbGF5JywgJ25vbmUnKTtcbiAgXHRcdFx0XHR2YXIgZWwgPSBkb2N1bWVudC5lbGVtZW50RnJvbVBvaW50KGQzLmV2ZW50LmNsaWVudFgsIGQzLmV2ZW50LmNsaWVudFkpO1xuICBcdFx0XHRcdHpvb21SZWN0LmF0dHIoJ2Rpc3BsYXknLCAnYmxvY2snKTtcbiAgXHRcdFx0XHRpZiAoZWwudGFnTmFtZSAhPT0gJ2NpcmNsZScpIHJldHVybjtcbiAgXHRcdFx0XHRjb25maWcuZXZlbnRDbGljayhlbCk7XG4gIFx0XHRcdCAgfSk7XG4gIFx0XHRcdH1cblxuICAgICAgICB4U2NhbGUucmFuZ2UoWzAsIGdyYXBoV2lkdGhdKS5kb21haW4oW2NvbmZpZy5zdGFydCwgY29uZmlnLmVuZF0pO1xuXG4gICAgICAgIHpvb20ueCh4U2NhbGUpO1xuXG4gICAgICAgIGZ1bmN0aW9uIHVwZGF0ZVpvb20oKSB7XG4gICAgICAgICAgaWYgKGQzLmV2ZW50LnNvdXJjZUV2ZW50ICYmIGQzLmV2ZW50LnNvdXJjZUV2ZW50LnRvU3RyaW5nKCkgPT09ICdbb2JqZWN0IE1vdXNlRXZlbnRdJykge1xuICAgICAgICAgICAgem9vbS50cmFuc2xhdGUoW2QzLmV2ZW50LnRyYW5zbGF0ZVswXSwgMF0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChkMy5ldmVudC5zb3VyY2VFdmVudCAmJiBkMy5ldmVudC5zb3VyY2VFdmVudC50b1N0cmluZygpID09PSAnW29iamVjdCBXaGVlbEV2ZW50XScpIHtcbiAgICAgICAgICAgIHpvb20uc2NhbGUoZDMuZXZlbnQuc2NhbGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZWRyYXcoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGluaXRpYWxpemF0aW9uIG9mIHRoZSBkZWxpbWl0ZXJcbiAgICAgICAgc3ZnLnNlbGVjdCgnLmRlbGltaXRlcicpLnJlbW92ZSgpO1xuICAgICAgICB2YXIgZGVsaW1pdGVyRWwgPSBzdmdcbiAgICAgICAgICAuYXBwZW5kKCdnJylcbiAgICAgICAgICAuY2xhc3NlZCgnZGVsaW1pdGVyJywgdHJ1ZSlcbiAgICAgICAgICAuYXR0cignd2lkdGgnLCBncmFwaFdpZHRoKVxuICAgICAgICAgIC5hdHRyKCdoZWlnaHQnLCAxMClcbiAgICAgICAgICAuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgnICsgY29uZmlnLm1hcmdpbi5sZWZ0ICsgJywgJyArIChjb25maWcubWFyZ2luLnRvcCAtIDQ1KSArICcpJylcbiAgICAgICAgICAuY2FsbChkZWxpbWl0ZXIoe1xuICAgICAgICAgICAgeFNjYWxlOiB4U2NhbGUsXG4gICAgICAgICAgICBkYXRlRm9ybWF0OiBjb25maWcubG9jYWxlID8gY29uZmlnLmxvY2FsZS50aW1lRm9ybWF0KFwiJWQgJUIgJVlcIikgOiBkMy50aW1lLmZvcm1hdChcIiVkICVCICVZXCIpXG4gICAgICAgICAgfSkpXG4gICAgICAgIDtcblxuICAgICAgICBmdW5jdGlvbiByZWRyYXdEZWxpbWl0ZXIoKSB7XG4gICAgICAgICAgZGVsaW1pdGVyRWwuY2FsbChkZWxpbWl0ZXIoe1xuICAgICAgICAgICAgeFNjYWxlOiB4U2NhbGUsXG4gICAgICAgICAgICBkYXRlRm9ybWF0OiBjb25maWcubG9jYWxlID8gY29uZmlnLmxvY2FsZS50aW1lRm9ybWF0KFwiJWQgJUIgJVlcIikgOiBkMy50aW1lLmZvcm1hdChcIiVkICVCICVZXCIpXG4gICAgICAgICAgfSkpO1xuICAgICAgICB9XG5cbiAgXHRcdFx0ZnVuY3Rpb24gem9vbUVuZCgpIHtcbiAgXHRcdFx0ICBpZiAoY29uZmlnLmV2ZW50Wm9vbSkge1xuICBcdFx0XHRcdCAgY29uZmlnLmV2ZW50Wm9vbSh4U2NhbGUpO1xuICBcdFx0XHQgIH1cbiAgXHRcdFx0ICBpZiAoY29uZmlnLmhhc0RlbGltaXRlcikge1xuICBcdFx0XHRcdCAgcmVkcmF3RGVsaW1pdGVyKCk7XG4gIFx0XHRcdCAgfVxuICBcdFx0XHR9XG5cbiAgICAgICAgdmFyIGhhc1RvcEF4aXMgPSB0eXBlb2YgY29uZmlnLmhhc1RvcEF4aXMgPT09ICdmdW5jdGlvbicgPyBjb25maWcuaGFzVG9wQXhpcyhkYXRhKSA6IGNvbmZpZy5oYXNUb3BBeGlzO1xuICAgICAgICBpZiAoaGFzVG9wQXhpcykge1xuICAgICAgICAgIHhBeGlzVG9wID0geEF4aXNGYWN0b3J5KGQzLCBjb25maWcsIHhTY2FsZSwgZ3JhcGgsIGdyYXBoSGVpZ2h0LCAndG9wJyk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgaGFzQm90dG9tQXhpcyA9IHR5cGVvZiBjb25maWcuaGFzQm90dG9tQXhpcyA9PT0gJ2Z1bmN0aW9uJyA/IGNvbmZpZy5oYXNCb3R0b21BeGlzKGRhdGEpIDogY29uZmlnLmhhc0JvdHRvbUF4aXM7XG4gICAgICAgIGlmIChoYXNCb3R0b21BeGlzKSB7XG4gICAgICAgICAgeEF4aXNCb3R0b20gPSB4QXhpc0ZhY3RvcnkoZDMsIGNvbmZpZywgeFNjYWxlLCBncmFwaCwgZ3JhcGhIZWlnaHQsICdib3R0b20nKTtcbiAgICAgICAgfVxuXG4gIFx0XHRcdGZ1bmN0aW9uIGRyYXdYQXhpcyh3aGVyZSkge1xuXG4gIFx0XHRcdCAgLy8gY29weSBjb25maWcudGlja0Zvcm1hdCBiZWNhdXNlIGQzIGZvcm1hdC5tdWx0aSBlZGl0IGl0cyBnaXZlbiB0aWNrRm9ybWF0IGRhdGFcbiAgXHRcdFx0ICB2YXIgdGlja0Zvcm1hdERhdGEgPSBbXTtcblxuICBcdFx0XHQgIGNvbmZpZy50aWNrRm9ybWF0LmZvckVhY2goZnVuY3Rpb24gKGl0ZW0pIHtcbiAgXHRcdFx0XHR2YXIgdGljayA9IGl0ZW0uc2xpY2UoMCk7XG4gIFx0XHRcdFx0dGlja0Zvcm1hdERhdGEucHVzaCh0aWNrKTtcbiAgXHRcdFx0ICB9KTtcblxuICBcdFx0XHQgIHZhciB0aWNrRm9ybWF0ID0gY29uZmlnLmxvY2FsZSA/IGNvbmZpZy5sb2NhbGUudGltZUZvcm1hdC5tdWx0aSh0aWNrRm9ybWF0RGF0YSkgOiBkMy50aW1lLmZvcm1hdC5tdWx0aSh0aWNrRm9ybWF0RGF0YSk7XG4gIFx0XHRcdCAgdmFyIHhBeGlzID0gZDMuc3ZnLmF4aXMoKVxuICBcdFx0XHRcdC5zY2FsZSh4U2NhbGUpXG4gIFx0XHRcdFx0Lm9yaWVudCh3aGVyZSlcbiAgXHRcdFx0XHQudGlja0Zvcm1hdCh0aWNrRm9ybWF0KVxuICBcdFx0XHQgIDtcblxuICBcdFx0XHQgIGlmICh0eXBlb2YgY29uZmlnLmF4aXNGb3JtYXQgPT09ICdmdW5jdGlvbicpIHtcbiAgXHRcdFx0XHRjb25maWcuYXhpc0Zvcm1hdCh4QXhpcyk7XG4gIFx0XHRcdCAgfVxuXG4gIFx0XHRcdCAgdmFyIHkgPSAod2hlcmUgPT0gJ2JvdHRvbScgPyBwYXJzZUludChncmFwaEhlaWdodCkgOiAwKSArIGNvbmZpZy5tYXJnaW4udG9wIC0gNDA7XG5cbiAgXHRcdFx0ICBncmFwaC5zZWxlY3QoJy54LWF4aXMuJyArIHdoZXJlKS5yZW1vdmUoKTtcbiAgXHRcdFx0ICB2YXIgeEF4aXNFbCA9IGdyYXBoXG4gICAgXHRcdFx0XHQuYXBwZW5kKCdnJylcbiAgICBcdFx0XHRcdC5jbGFzc2VkKCd4LWF4aXMnLCB0cnVlKVxuICAgIFx0XHRcdFx0LmNsYXNzZWQod2hlcmUsIHRydWUpXG4gICAgXHRcdFx0XHQuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgnICsgY29uZmlnLm1hcmdpbi5sZWZ0ICsgJywgJyArIHkgKyAnKScpXG4gICAgXHRcdFx0XHQuY2FsbCh4QXhpcylcbiAgXHRcdFx0ICA7XG4gIFx0XHRcdH1cblxuICBcdFx0XHQvLyBpbml0aWFsaXphdGlvbiBvZiB0aGUgZ3JhcGggYm9keVxuICAgICAgICB6b29tLnNpemUoW2NvbmZpZy53aWR0aCwgaGVpZ2h0XSk7XG5cbiAgICAgICAgZ3JhcGguc2VsZWN0KCcuZ3JhcGgtYm9keScpLnJlbW92ZSgpO1xuICAgICAgICB2YXIgZ3JhcGhCb2R5ID0gZ3JhcGhcbiAgICAgICAgICAuYXBwZW5kKCdnJylcbiAgICAgICAgICAuY2xhc3NlZCgnZ3JhcGgtYm9keScsIHRydWUpXG4gICAgICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoJyArIGNvbmZpZy5tYXJnaW4ubGVmdCArICcsICcgKyAoY29uZmlnLm1hcmdpbi50b3AgLSAxNSkgKyAnKScpO1xuXG4gICAgICAgIHZhciBsaW5lcyA9IGdyYXBoQm9keS5zZWxlY3RBbGwoJ2cnKS5kYXRhKGRhdGEpO1xuXG4gICAgICAgIGxpbmVzLmVudGVyKClcbiAgICAgICAgICAuYXBwZW5kKCdnJylcbiAgICAgICAgICAuY2xhc3NlZCgnbGluZScsIHRydWUpXG4gICAgICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsIGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICAgIHJldHVybiAndHJhbnNsYXRlKDAsJyArIHlTY2FsZShkLm5hbWUpICsgJyknO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLnN0eWxlKCdmaWxsJywgY29uZmlnLmV2ZW50TGluZUNvbG9yKVxuICAgICAgICAgIC5jYWxsKGV2ZW50TGluZSh7IHhTY2FsZTogeFNjYWxlLCBldmVudENvbG9yOiBjb25maWcuZXZlbnRDb2xvciB9KSlcbiAgICAgICAgO1xuXG4gICAgICAgIGxpbmVzLmV4aXQoKS5yZW1vdmUoKTtcblxuICAgICAgICBmdW5jdGlvbiByZWRyYXcoKSB7XG4gICAgICAgICAgLy8gU3RvcmUgdGhlIGN1cnJlbnQgdHJhbnNmb3JtYXRpb24gbWF0cml4XG4gICAgICAgICAgY3R4LnNhdmUoKTtcbiAgICAgICAgICAvLyBTZXQgYmFjayB0byB0aGUgb3JpZ2luYWwgY2FudmFzXG4gICAgICAgICAgY3R4LnNldFRyYW5zZm9ybSgxLCAwLCAwLCAxLCAwLCAwKTtcbiAgICAgICAgICAvLyBDbGVhciB0aGUgY2FudmFzXG4gICAgICAgICAgY3R4LmNsZWFyUmVjdCgwLCAwLCBncmFwaFdpZHRoLCBncmFwaEhlaWdodCk7XG4gICAgICAgICAgLy8gUmVzdG9yZSB0aGUgZm9ybWVyIGNvb3JkaW5hdGVzXG4gICAgICAgICAgY3R4LnJlc3RvcmUoKTtcblxuICAgICAgICAgIHZhciBoYXNUb3BBeGlzID0gdHlwZW9mIGNvbmZpZy5oYXNUb3BBeGlzID09PSAnZnVuY3Rpb24nID8gY29uZmlnLmhhc1RvcEF4aXMoZGF0YSkgOiBjb25maWcuaGFzVG9wQXhpcztcbiAgICAgICAgICBpZiAoaGFzVG9wQXhpcykge1xuICAgICAgICAgICAgeEF4aXNUb3AuZHJhd1hBeGlzKCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdmFyIGhhc0JvdHRvbUF4aXMgPSB0eXBlb2YgY29uZmlnLmhhc0JvdHRvbUF4aXMgPT09ICdmdW5jdGlvbicgPyBjb25maWcuaGFzQm90dG9tQXhpcyhkYXRhKSA6IGNvbmZpZy5oYXNCb3R0b21BeGlzO1xuICAgICAgICAgIGlmIChoYXNCb3R0b21BeGlzKSB7XG4gICAgICAgICAgICB4QXhpc0JvdHRvbS5kcmF3WEF4aXMoKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBsaW5lcy5jYWxsKGV2ZW50TGluZSh7IHhTY2FsZTogeFNjYWxlLCB5U2NhbGU6IHlTY2FsZSwgZXZlbnRMaW5lQ29sb3I6IGNvbmZpZy5ldmVudExpbmVDb2xvciwgZXZlbnRDb2xvcjogY29uZmlnLmV2ZW50Q29sb3IgfSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmVkcmF3KCk7XG4gICAgICAgIGlmIChjb25maWcuaGFzRGVsaW1pdGVyKSB7XG4gICAgICAgICAgcmVkcmF3RGVsaW1pdGVyKHhTY2FsZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNvbmZpZy5ldmVudFpvb20pIHtcbiAgICAgICAgICBjb25maWcuZXZlbnRab29tKHhTY2FsZSk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgfVxuXHRjb25maWd1cmFibGUoZXZlbnREcm9wR3JhcGgsIGNvbmZpZyk7XG5cdHJldHVybiBldmVudERyb3BHcmFwaDtcbiAgfTtcbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcbi8qIGdsb2JhbCByZXF1aXJlLCBtb2R1bGUsIGQzICovXG5cbnZhciBjb25maWd1cmFibGUgPSByZXF1aXJlKCcuL3V0aWwvY29uZmlndXJhYmxlJyk7XG52YXIgZmlsdGVyRGF0YSA9IHJlcXVpcmUoJy4vZmlsdGVyRGF0YScpO1xuXG52YXIgZGVmYXVsdENvbmZpZyA9IHtcbiAgeFNjYWxlOiBudWxsLFxuICB5U2NhbGU6IG51bGxcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGQzLCBjb250ZXh0KSB7XG4gIHJldHVybiBmdW5jdGlvbiAoY29uZmlnKSB7XG5cbiAgICBjb25maWcgPSBjb25maWcgfHwge1xuICAgICAgeFNjYWxlOiBudWxsLFxuICAgICAgeVNjYWxlOiBudWxsLFxuICAgICAgZXZlbnRMaW5lQ29sb3I6ICdibGFjaycsXG4gICAgICB3aWR0aDogMCxcbiAgICAgIGhlaWdodDogMFxuICAgIH07XG4gICAgZm9yICh2YXIga2V5IGluIGRlZmF1bHRDb25maWcpIHtcbiAgICAgIGNvbmZpZ1trZXldID0gY29uZmlnW2tleV0gfHwgZGVmYXVsdENvbmZpZ1trZXldO1xuICAgIH1cblxuICAgIHZhciBldmVudExpbmUgPSBmdW5jdGlvbiBldmVudExpbmUoc2VsZWN0aW9uKSB7XG4gICAgICBzZWxlY3Rpb24uZWFjaChmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICBkMy5zZWxlY3QodGhpcykuc2VsZWN0QWxsKCd0ZXh0JykucmVtb3ZlKCk7XG5cbiAgICAgICAgZDMuc2VsZWN0KHRoaXMpLmFwcGVuZCgndGV4dCcpXG4gICAgICAgICAgLnRleHQoZnVuY3Rpb24oZCkge1xuICAgICAgICAgICAgdmFyIGNvdW50ID0gZmlsdGVyRGF0YShkLmRhdGVzLCBjb25maWcueFNjYWxlKS5sZW5ndGg7XG4gICAgICAgICAgICByZXR1cm4gZC5uYW1lICsgKGNvdW50ID4gMCA/ICcgKCcgKyBjb3VudCArICcpJyA6ICcnKTtcbiAgICAgICAgICB9KVxuICAgICAgICAgIC5hdHRyKCd0ZXh0LWFuY2hvcicsICdlbmQnKVxuICAgICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKC0yMCknKVxuICAgICAgICAgIC5zdHlsZSgnZmlsbCcsICdibGFjaycpXG4gICAgICAgIDtcblxuICAgICAgICB2YXIgZGF0YUNvbnRhaW5lciA9IGQzLnNlbGVjdChcImJvZHlcIikuYXBwZW5kKCdjdXN0b20nKTtcblxuICAgICAgICBmdW5jdGlvbiBkcmF3Q3VzdG9tIChkYXRhKSB7XG4gICAgICAgICAgdmFyIGRhdGVzID0gZmlsdGVyRGF0YShkYXRhLmRhdGVzLCBjb25maWcueFNjYWxlKTtcbiAgICAgICAgICB2YXIgeSA9IDA7XG4gICAgICAgICAgaWYgKHR5cGVvZiBjb25maWcueVNjYWxlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICB5ID0gY29uZmlnLnlTY2FsZShkYXRhLm5hbWUpICsgMjU7XG4gICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICB5ID0gY29uZmlnLnlTY2FsZSArIDI1O1xuICAgICAgICAgIH1cbiAgICAgICAgICB2YXIgY29sb3IgPSAnYmxhY2snO1xuICAgICAgICAgIGlmIChjb25maWcuZXZlbnRMaW5lQ29sb3IpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgY29uZmlnLmV2ZW50TGluZUNvbG9yID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgIGNvbG9yID0gY29uZmlnLmV2ZW50TGluZUNvbG9yKGRhdGEsIGRhdGEubmFtZSk7XG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgY29sb3IgPSBjb25maWcuZXZlbnRMaW5lQ29sb3I7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKGNvbnRleHQpIHtcbiAgICAgICAgICAgIGRyYXdMaW5lKGRhdGVzLCB5LCBjb2xvciwgY29udGV4dCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gZHJhd0xpbmUoZGF0ZXMsIHksIGNvbG9yLCBjb250ZXh0KSB7XG4gICAgICAgICAgZGF0ZXMuZm9yRWFjaChmdW5jdGlvbihkYXRlKSB7XG4gICAgICAgICAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgICAgICAgICAgY29udGV4dC5maWxsU3R5bGUgPSBjb2xvcjtcbiAgICAgICAgICAgIGNvbnRleHQuYXJjKGNvbmZpZy54U2NhbGUoZGF0ZSksIHksIDEwLCAwLCAyICogTWF0aC5QSSk7XG4gICAgICAgICAgICBjb250ZXh0LmZpbGwoKTtcbiAgICAgICAgICAgIGNvbnRleHQuY2xvc2VQYXRoKCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBkcmF3Q3VzdG9tKGRhdGEpO1xuICAgICAgfSk7XG4gICAgfTtcblxuICAgIGNvbmZpZ3VyYWJsZShldmVudExpbmUsIGNvbmZpZyk7XG5cbiAgICByZXR1cm4gZXZlbnRMaW5lO1xuICB9O1xufTtcbiIsIlwidXNlIHN0cmljdFwiO1xuLyogZ2xvYmFsIG1vZHVsZSAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGZpbHRlckRhdGUoZGF0YSwgc2NhbGUpIHtcbiAgZGF0YSA9IGRhdGEgfHwgW107XG4gIHZhciBib3VuZGFyeSA9IHNjYWxlLnJhbmdlKCk7XG4gIHZhciBtaW4gPSBib3VuZGFyeVswXTtcbiAgdmFyIG1heCA9IGJvdW5kYXJ5WzFdO1xuXG4gIHJldHVybiBkYXRhLmZpbHRlcihmdW5jdGlvbiAoZGF0dW0pIHtcbiAgICB2YXIgdmFsdWUgPSBzY2FsZShkYXR1bSk7XG4gICAgcmV0dXJuICEodmFsdWUgPCBtaW4gfHwgdmFsdWUgPiBtYXgpO1xuICB9KTtcbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcbi8qIGdsb2JhbCByZXF1aXJlLCBkZWZpbmUsIG1vZHVsZSAqL1xuXG52YXIgZXZlbnREcm9wcyA9IHJlcXVpcmUoJy4vZXZlbnREcm9wcycpO1xuXG5pZiAodHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQpIHtcbiAgZGVmaW5lKCdkMy5jaGFydC5ldmVudERyb3BzJywgW1wiZDNcIl0sIGZ1bmN0aW9uIChkMykge1xuICAgIGQzLmNoYXJ0ID0gZDMuY2hhcnQgfHwge307XG4gICAgZDMuY2hhcnQuZXZlbnREcm9wcyA9IGV2ZW50RHJvcHMoZDMsIGRvY3VtZW50KTtcbiAgfSk7XG59IGVsc2UgaWYgKHdpbmRvdykge1xuICB3aW5kb3cuZDMuY2hhcnQgPSB3aW5kb3cuZDMuY2hhcnQgfHwge307XG4gIHdpbmRvdy5kMy5jaGFydC5ldmVudERyb3BzID0gZXZlbnREcm9wcyh3aW5kb3cuZDMsIGRvY3VtZW50KTtcbn0gZWxzZSB7XG4gIG1vZHVsZS5leHBvcnRzID0gZXZlbnREcm9wcztcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY29uZmlndXJhYmxlKHRhcmdldEZ1bmN0aW9uLCBjb25maWcsIGxpc3RlbmVycykge1xuICBsaXN0ZW5lcnMgPSBsaXN0ZW5lcnMgfHwge307XG4gIGZvciAodmFyIGl0ZW0gaW4gY29uZmlnKSB7XG4gICAgKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgIHRhcmdldEZ1bmN0aW9uW2l0ZW1dID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gY29uZmlnW2l0ZW1dO1xuICAgICAgICBjb25maWdbaXRlbV0gPSB2YWx1ZTtcbiAgICAgICAgaWYgKGxpc3RlbmVycy5oYXNPd25Qcm9wZXJ0eShpdGVtKSkge1xuICAgICAgICAgIGxpc3RlbmVyc1tpdGVtXSh2YWx1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGFyZ2V0RnVuY3Rpb247XG4gICAgICB9O1xuICAgIH0pKGl0ZW0pOyAvLyBmb3IgZG9lc24ndCBjcmVhdGUgYSBjbG9zdXJlLCBmb3JjaW5nIGl0XG4gIH1cbn07XG4iLCJcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZDMsIGNvbmZpZywgeFNjYWxlLCBncmFwaCwgZ3JhcGhIZWlnaHQsIHdoZXJlKSB7XG4gIHZhciB4QXhpcyA9IHt9O1xuICB2YXIgeEF4aXNFbHMgPSB7fTtcblxuICB2YXIgdGlja0Zvcm1hdERhdGEgPSBbXTtcblxuICBjb25maWcudGlja0Zvcm1hdC5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgdmFyIHRpY2sgPSBpdGVtLnNsaWNlKDApO1xuICAgIHRpY2tGb3JtYXREYXRhLnB1c2godGljayk7XG4gIH0pO1xuXG4gIHZhciB0aWNrRm9ybWF0ID0gY29uZmlnLmxvY2FsZSA/IGNvbmZpZy5sb2NhbGUudGltZUZvcm1hdC5tdWx0aSh0aWNrRm9ybWF0RGF0YSkgOiBkMy50aW1lLmZvcm1hdC5tdWx0aSh0aWNrRm9ybWF0RGF0YSk7XG4gIHhBeGlzW3doZXJlXSA9IGQzLnN2Zy5heGlzKClcbiAgICAuc2NhbGUoeFNjYWxlKVxuICAgIC5vcmllbnQod2hlcmUpXG4gICAgLnRpY2tGb3JtYXQodGlja0Zvcm1hdClcbiAgO1xuXG4gIGlmICh0eXBlb2YgY29uZmlnLmF4aXNGb3JtYXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICBjb25maWcuYXhpc0Zvcm1hdCh4QXhpcyk7XG4gIH1cblxuICB2YXIgeSA9ICh3aGVyZSA9PSAnYm90dG9tJyA/IHBhcnNlSW50KGdyYXBoSGVpZ2h0KSA6IDApICsgY29uZmlnLm1hcmdpbi50b3AgLSA0MDtcblxuICB4QXhpc0Vsc1t3aGVyZV0gPSBncmFwaFxuICAgIC5hcHBlbmQoJ2cnKVxuICAgIC5jbGFzc2VkKCd4LWF4aXMnLCB0cnVlKVxuICAgIC5jbGFzc2VkKHdoZXJlLCB0cnVlKVxuICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCcgKyBjb25maWcubWFyZ2luLmxlZnQgKyAnLCAnICsgeSArICcpJylcbiAgICAuY2FsbCh4QXhpc1t3aGVyZV0pXG4gIDtcblxuICB2YXIgZHJhd1hBeGlzID0gZnVuY3Rpb24gZHJhd1hBeGlzKCkge1xuICAgIHhBeGlzRWxzW3doZXJlXVxuICAgICAgLmNhbGwoeEF4aXNbd2hlcmVdKVxuICAgIDtcbiAgfTtcblxuICByZXR1cm4ge1xuICAgIGRyYXdYQXhpczogZHJhd1hBeGlzXG4gIH07XG59O1xuIl19
