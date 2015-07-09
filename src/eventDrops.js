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
  //var eventLine = require('./eventLine')(d3);
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

		  	//window.requestAnimFrame = (function(){
		    //  return  window.requestAnimationFrame       ||
		    //          window.webkitRequestAnimationFrame ||
		    //          window.mozRequestAnimationFrame    ||
		    //          window.oRequestAnimationFrame      ||
		    //          window.msRequestAnimationFrame     ||
		    //          function(/* function */ callback, /* DOMElement */ element) {
		    //            window.setTimeout(callback, 1000 / 60);
		    //          };
	    	//})();

				var zoom = d3.behavior.zoom().center(null).scaleExtent([config.minScale, config.maxScale]).on("zoom", updateZoom);

				zoom.on("zoomend", zoomEnd);
        zoom.on("zoomstart", zoomStart);

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

        d3.select(this).select('canvas').remove();
    		var canvas = d3.select(this)
    		  .append('canvas')
    		  .attr('id', "mon_canvas")
    		  .attr('width', canvas_width)
    		  .attr('height', canvas_height);

        var base = d3.select(this);

  		  var ctx = (canvas.node()).getContext('2d');

        var eventLine = require('./eventLine')(d3, ctx);

  			function drawAgain(){
  			  // Clear the entire canvas
  			  var topX = 0;
  			  var topY = 0;
  			  ctx.clearRect(topX, topY, topX + canvas.node().width, topY + canvas.node().height);

  			}

  			// draw the canvas for the first time

  			drawAgain();

        canvas.node().addEventListener('mousedown', function (evt) {
          // permits compatibility with every browser
          document.body.style.mozUserSelect = document.body.style.webkitUserSelect = document.body.style.userSelect = 'none';
          lastX = evt.clientX;
          dragStart = {
            x : lastX,
            y : lastY
          };
          dragged = false;
          mouseDown++;
        },false);

        canvas.node().addEventListener('mousemove', function (evt) {
          lastX = evt.clientX;
          dragged = true;
          if (dragStart && mouseDown){
            ctx.translate(lastX-dragStart.x, lastY-dragStart.y);
            drawAgain();
            redraw();
          }
        },false);

        canvas.node().addEventListener('mouseup', function (evt) {
          dragStart = null;
          mouseDown--;
          if (!dragged) zoom(evt.shiftKey ? -1 : 1 );
        },false);

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

        var coorX_start;

        var coorX_end;

        var count = 0;

        function translateCanvas(x, y) {
          ctx.translate(y - x, 0);
          return y;
        }

        function zoomStart() {
          if (d3.event.sourceEvent.toString() === '[object MouseEvent]') {
            //console.log(d3.mouse(this)[0]);
            coorX_start = d3.mouse(this)[0];
          }
        }

        function updateZoom() {
          if (d3.event.sourceEvent && d3.event.sourceEvent.toString() === '[object MouseEvent]') {
            zoom.translate([d3.event.translate[0], 0]);
            coorX_start = translateCanvas(coorX_start, d3.mouse(this)[0]);
            coorX_start = d3.mouse(this)[0];
          }

          if (d3.event.sourceEvent && d3.event.sourceEvent.toString() === '[object WheelEvent]') {
            zoom.scale(d3.event.scale);
          }
          //drawAgain();
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
          if (d3.event.sourceEvent.toString() === '[object MouseEvent]') {
            coorX_end = d3.mouse(this)[0];
            ctx.translate(coorX_end - coorX_start, 0);
            //drawAgain();
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
      eventLineColor: 'black'
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwibGliL2NhbnZhc0hhbmRsZXIuanMiLCJsaWIvZGVsaW1pdGVyLmpzIiwibGliL2V2ZW50RHJvcHMuanMiLCJsaWIvZXZlbnRMaW5lLmpzIiwibGliL2ZpbHRlckRhdGEuanMiLCJsaWIvbWFpbi5qcyIsImxpYi91dGlsL2NvbmZpZ3VyYWJsZS5qcyIsImxpYi94QXhpcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlwidXNlIHN0cmljdFwiO1xuLyogZ2xvYmFsIHJlcXVpcmUsIG1vZHVsZSAqL1xuXG52YXIgZGVmYXVsdENvbmZpZyA9IHtcbiAgeFNjYWxlOiBudWxsXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChkMywgZG9jdW1lbnQsIGNvbmZpZykge1xuICByZXR1cm4gZnVuY3Rpb24gKGNvbmZpZykge1xuXG4gICAgY29uZmlnID0gY29uZmlnIHx8IHtcbiAgICAgIHhTY2FsZTogbnVsbCxcbiAgICAgIGV2ZW50Q29sb3I6IG51bGxcbiAgICB9O1xuICAgIGZvciAodmFyIGtleSBpbiBkZWZhdWx0Q29uZmlnKSB7XG4gICAgIGNvbmZpZ1trZXldID0gY29uZmlnW2tleV0gfHwgZGVmYXVsdENvbmZpZ1trZXldO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNhbnZhc0hhbmRsZXIoeCwgeSkge1xuICAgICAgdGhpcy5ncmFwaFdpZHRoID0geDtcbiAgICAgIHRoaXMuZ3JhcGhIZWlnaHQgPSB5O1xuICAgICAgdGhpcy5sYXN0WCA9IGdyYXBoV2lkdGgvMjtcbiAgICAgIHRoaXMubGFzdFkgPSBncmFwaEhlaWdodC8yO1xuICAgICAgdGhpcy5tb3VzZURvd24gPSAwO1xuICAgICAgdGhpcy5jdHggPSBudWxsO1xuICAgICAgdGhpcy5jYW52YXMgPSBudWxsO1xuICAgIH1cblxuICAgIC8qdmFyIGdyYXBoSGVpZ2h0LCBncmFwaFdpZHRoO1xuICAgIHZhciBsYXN0WCwgbGFzdFk7XG4gICAgdmFyIGN0eDtcbiAgICB2YXIgbW91c2VEb3duID0gMDtcbiAgICB2YXIgZHJhZ1N0YXJ0LCBkcmFnZ2VkOyovXG5cbiAgICAvKnZhciBjYW52YXNIYW5kbGVyID0gZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGdyYXBoV2lkdGggPSBjb25maWcud2lkdGggLSBjb25maWcubWFyZ2luLnJpZ2h0IC0gY29uZmlnLm1hcmdpbi5sZWZ0O1xuICAgICAgYWxlcnQoZ3JhcGhXaWR0aCk7XG4gICAgICB2YXIgZ3JhcGhIZWlnaHQgPSBkYXRhLmxlbmd0aCAqIDQwO1xuICAgICAgYWxlcnQoZ3JhcGhIZWlnaHQpO1xuICAgICAgdmFyIGN0eCA9IChjYW52YXMubm9kZSgpKS5nZXRDb250ZXh0KCcyZCcpO1xuICAgICAgdmFyIG1vdXNlRG93biA9IDA7XG4gICAgICB2YXIgbGFzdFggPSBncmFwaFdpZHRoLzI7XG4gICAgICB2YXIgbGFzdFkgPSBncmFwaEhlaWdodC8yO1xuICAgIH0qL1xuXG4gICAgICB0aGlzLmluaXQgPSBmdW5jdGlvbiAoc2VsZWN0aW9uLCB4LCB5KSB7XG4gICAgICAgIC8qdGhpcy5ncmFwaFdpZHRoID0geDtcbiAgICAgICAgdGhpcy5ncmFwaEhlaWdodCA9IHk7XG4gICAgICAgIHRoaXMubW91c2VEb3duID0gMDtcbiAgICAgICAgdGhpcy5sYXN0WCA9IHgvMjtcbiAgICAgICAgdGhpcy5sYXN0WSA9IHkvMjsqL1xuXG4gICAgICAgIHNlbGVjdGlvbi5lYWNoKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgZDMuc2VsZWN0KHRoaXMpLnNlbGVjdCgnY2FudmFzJykucmVtb3ZlKCk7XG4gICAgICAgICAgdmFyIGNhbnZhcyA9IGQzLnNlbGVjdCh0aGlzKVxuICAgICAgICAgICAgLmFwcGVuZCgnY2FudmFzJylcbiAgICAgICAgICAgIC5hdHRyKCdpZCcsIFwibW9uX2NhbnZhc1wiKVxuICAgICAgICAgICAgLmF0dHIoJ3dpZHRoJywgdGhpcy5ncmFwaFdpZHRoKVxuICAgICAgICAgICAgLmF0dHIoJ2hlaWdodCcsIHRoaXMuZ3JhcGhIZWlnaHQpXG4gICAgICAgICAgICA7XG4gICAgICAgICAgdGhpcy5jdHggPSBjYW52YXMubm9kZSgpLmdldENvbnRleHQoJzJkJyk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmRyYXcgPSBmdW5jdGlvbigpe1xuICAgICAgICAvLyBDbGVhciB0aGUgZW50aXJlIGNhbnZhc1xuICAgICAgICB2YXIgdG9wWCA9IDA7XG4gICAgICAgIHZhciB0b3BZID0gMDtcbiAgICAgICAgLy9hbGVydChncmFwaFdpZHRoKTtcbiAgICAgICAgdGhpcy5jdHguY2xlYXJSZWN0KHRvcFgsIHRvcFksIHRvcFggKyBncmFwaFdpZHRoLCB0b3BZICsgZ3JhcGhIZWlnaHQpO1xuXG4gICAgICAgIGN0eC5mb250ID0gXCIzMHB4IEFyaWFsXCI7XG4gICAgICAgIGN0eC50ZXh0QWxpZ24gPSBcImNlbnRlclwiO1xuICAgICAgICBjdHguZmlsbFRleHQoXCJUb3RvXCIsNzUwLzIsMzUpO1xuICAgICAgICBjdHguZmlsbFRleHQoXCJUb3RvXCIsNzUwLzIsNzUpO1xuICAgICAgICBjdHguZmlsbFRleHQoXCJUb3RvXCIsNzUwLzIsMTE1KTtcbiAgICAgICAgY3R4LmZpbGxUZXh0KFwiVG90b1wiLDc1MC8yLDE1NSk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuZHJhd0NpcmNsZSA9IGZ1bmN0aW9uICh4LCB5KSB7XG4gICAgICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XG4gICAgICAgIGNvbnRleHQubGluZVdpZHRoPVwiMlwiO1xuICAgICAgICBjb250ZXh0LmZpbGxTdHlsZT1cIiNGRjQ0MjJcIjtcbiAgICAgICAgY29udGV4dC5hcmMoeCwgeSwgOTAsIDAsIDIgKiBNYXRoLlBJKTtcbiAgICAgICAgY29udGV4dC5maWxsKCk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMubW91c2VEb3duSGFuZGxlciA9IGZ1bmN0aW9uKGV2dCl7XG4gICAgICAgIC8vIHBlcm1pdHMgY29tcGF0aWJpbGl0eSB3aXRoIGV2ZXJ5IGJyb3dzZXJcbiAgICAgICAgZG9jdW1lbnQuYm9keS5zdHlsZS5tb3pVc2VyU2VsZWN0ID0gZG9jdW1lbnQuYm9keS5zdHlsZS53ZWJraXRVc2VyU2VsZWN0ID0gZG9jdW1lbnQuYm9keS5zdHlsZS51c2VyU2VsZWN0ID0gJ25vbmUnO1xuICAgICAgICAvL2xhc3RYID0gZXZ0Lm9mZnNldFggfHwgKGV2dC5wYWdlWCAtIGNhbnZhcy5ub2RlKCkub2Zmc2V0TGVmdCk7XG4gICAgICAgIGxhc3RYID0gZXZ0LmNsaWVudFg7XG4gICAgICAgIC8vbGFzdFkgPSBncmFwaEhlaWdodC8yO1xuICAgICAgICAvL2FsZXJ0KGxhc3RYKTtcbiAgICAgICAgdmFyIGRyYWdTdGFydCA9IHtcbiAgICAgICAgICB4IDogbGFzdFgsXG4gICAgICAgICAgeSA6IGxhc3RZXG4gICAgICAgIH07XG4gICAgICAgIHZhciBkcmFnZ2VkID0gZmFsc2U7XG4gICAgICAgIG1vdXNlRG93bisrO1xuXG4gICAgICAgIC8vY2FudmFzLm5vZGUoKS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBjLm1vdXNlTW92ZUhhbmRsZXIsZmFsc2UpO1xuICAgICAgICAvL2NhbnZhcy5ub2RlKCkuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIGMubW91c2VVcEhhbmRsZXIsZmFsc2UpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLm1vdXNlTW92ZUhhbmRsZXIgPSBmdW5jdGlvbihldnQpe1xuICAgICAgICAvL2xhc3RYID0gZXZ0Lm9mZnNldFggfHwgKGV2dC5wYWdlWCAtIGNhbnZhcy5ub2RlKCkub2Zmc2V0TGVmdCk7XG4gICAgICAgIGxhc3RYID0gZXZ0LmNsaWVudFg7XG4gICAgICAgIGRyYWdnZWQgPSB0cnVlO1xuICAgICAgICBpZiAoZHJhZ1N0YXJ0ICYmIG1vdXNlRG93bil7XG4gICAgICAgICAgY3R4LnRyYW5zbGF0ZShsYXN0WC1kcmFnU3RhcnQueCwgbGFzdFktZHJhZ1N0YXJ0LnkpO1xuICAgICAgICAgIC8vY3R4LnRyYW5zbGF0ZShbZDMuZXZlbnQudHJhbnNsYXRlWzBdLCAwXSk7XG4gICAgICAgICAgZHJhd0FnYWluKCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy5tb3VzZVVwSGFuZGxlciA9IGZ1bmN0aW9uKGV2dCl7XG4gICAgICAgIC8vY2FudmFzLm5vZGUoKS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBjLm1vdXNlTW92ZUhhbmRsZXIsZmFsc2UpO1xuICAgICAgICAvL2NhbnZhcy5ub2RlKCkuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgYy5tb3VzZURvd25IYW5kbGVyLGZhbHNlKTtcblxuICAgICAgICBkcmFnU3RhcnQgPSBudWxsO1xuICAgICAgICBtb3VzZURvd24tLTtcbiAgICAgICAgaWYgKCFkcmFnZ2VkKSB6b29tKGV2dC5zaGlmdEtleSA/IC0xIDogMSApO1xuICAgICAgfVxuICB9XG59XG4iLCJcInVzZSBzdHJpY3RcIjtcbi8qIGdsb2JhbCByZXF1aXJlLCBtb2R1bGUsIGQzICovXG5cbnZhciBjb25maWd1cmFibGUgPSByZXF1aXJlKCcuL3V0aWwvY29uZmlndXJhYmxlJyk7XG5cbnZhciBkZWZhdWx0Q29uZmlnID0ge1xuICB4U2NhbGU6IG51bGwsXG4gIGRhdGVGb3JtYXQ6IG51bGxcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGQzKSB7XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIChjb25maWcpIHtcblxuICAgIGNvbmZpZyA9IGNvbmZpZyB8fCB7fTtcbiAgICBmb3IgKHZhciBrZXkgaW4gZGVmYXVsdENvbmZpZykge1xuICAgICAgY29uZmlnW2tleV0gPSBjb25maWdba2V5XSB8fCBkZWZhdWx0Q29uZmlnW2tleV07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZGVsaW1pdGVyKHNlbGVjdGlvbikge1xuICAgICAgc2VsZWN0aW9uLmVhY2goZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgZDMuc2VsZWN0KHRoaXMpLnNlbGVjdEFsbCgndGV4dCcpLnJlbW92ZSgpO1xuXG4gICAgICAgIHZhciBsaW1pdHMgPSBjb25maWcueFNjYWxlLmRvbWFpbigpO1xuXG4gICAgICAgIGQzLnNlbGVjdCh0aGlzKS5hcHBlbmQoJ3RleHQnKVxuICAgICAgICAgIC50ZXh0KGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgcmV0dXJuIGNvbmZpZy5kYXRlRm9ybWF0KGxpbWl0c1swXSk7XG4gICAgICAgICAgfSlcbiAgICAgICAgICAuY2xhc3NlZCgnc3RhcnQnLCB0cnVlKVxuICAgICAgICA7XG5cbiAgICAgICAgZDMuc2VsZWN0KHRoaXMpLmFwcGVuZCgndGV4dCcpXG4gICAgICAgICAgLnRleHQoZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICByZXR1cm4gY29uZmlnLmRhdGVGb3JtYXQobGltaXRzWzFdKTtcbiAgICAgICAgICB9KVxuICAgICAgICAgIC5hdHRyKCd0ZXh0LWFuY2hvcicsICdlbmQnKVxuICAgICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCcgKyBjb25maWcueFNjYWxlLnJhbmdlKClbMV0gKyAnKScpXG4gICAgICAgICAgLmNsYXNzZWQoJ2VuZCcsIHRydWUpXG4gICAgICAgIDtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGNvbmZpZ3VyYWJsZShkZWxpbWl0ZXIsIGNvbmZpZyk7XG5cbiAgICByZXR1cm4gZGVsaW1pdGVyO1xuICB9O1xufTtcbiIsIlwidXNlIHN0cmljdFwiO1xuLyogZ2xvYmFsIHJlcXVpcmUsIG1vZHVsZSAqL1xuXG52YXIgY29uZmlndXJhYmxlID0gcmVxdWlyZSgnLi91dGlsL2NvbmZpZ3VyYWJsZScpO1xudmFyIHhBeGlzRmFjdG9yeSA9IHJlcXVpcmUoJy4veEF4aXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZDMsIGRvY3VtZW50KSB7XG4gIC8vdmFyIGV2ZW50TGluZSA9IHJlcXVpcmUoJy4vZXZlbnRMaW5lJykoZDMpO1xuICB2YXIgZGVsaW1pdGVyID0gcmVxdWlyZSgnLi9kZWxpbWl0ZXInKShkMyk7XG4gIHZhciBjYW52YXNIYW5kbGVyID0gcmVxdWlyZSgnLi9jYW52YXNIYW5kbGVyJykoZDMsIGRvY3VtZW50KTtcbiAgdmFyIGZpbHRlckRhdGEgPSByZXF1aXJlKCcuL2ZpbHRlckRhdGEnKTtcblxuICB2YXIgZGVmYXVsdENvbmZpZyA9IHtcblx0XHRzdGFydDogbmV3IERhdGUoMCksXG5cdFx0ZW5kOiBuZXcgRGF0ZSgpLFxuXHRcdG1pblNjYWxlOiAwLFxuXHRcdG1heFNjYWxlOiBJbmZpbml0eSxcblx0XHR3aWR0aDogMTAwMCxcblx0XHRtYXJnaW46IHtcblx0XHQgIHRvcDogNjAsXG5cdFx0ICBsZWZ0OiAyMDAsXG5cdFx0ICBib3R0b206IDQwLFxuXHRcdCAgcmlnaHQ6IDUwXG5cdFx0fSxcblx0XHRsb2NhbGU6IG51bGwsXG5cdFx0YXhpc0Zvcm1hdDogbnVsbCxcblx0XHR0aWNrRm9ybWF0OiBbXG5cdFx0XHRbXCIuJUxcIiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gZC5nZXRNaWxsaXNlY29uZHMoKTsgfV0sXG5cdFx0XHRbXCI6JVNcIiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gZC5nZXRTZWNvbmRzKCk7IH1dLFxuXHRcdFx0W1wiJUk6JU1cIiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gZC5nZXRNaW51dGVzKCk7IH1dLFxuXHRcdFx0W1wiJUkgJXBcIiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gZC5nZXRIb3VycygpOyB9XSxcblx0XHRcdFtcIiVhICVkXCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQuZ2V0RGF5KCkgJiYgZC5nZXREYXRlKCkgIT0gMTsgfV0sXG5cdFx0XHRbXCIlYiAlZFwiLCBmdW5jdGlvbihkKSB7IHJldHVybiBkLmdldERhdGUoKSAhPSAxOyB9XSxcblx0XHRcdFtcIiVCXCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQuZ2V0TW9udGgoKTsgfV0sXG5cdFx0XHRbXCIlWVwiLCBmdW5jdGlvbigpIHsgcmV0dXJuIHRydWU7IH1dXG5cdFx0XSxcblx0XHRldmVudEhvdmVyOiBudWxsLFxuXHRcdGV2ZW50Wm9vbTogbnVsbCxcblx0XHRldmVudENsaWNrOiBudWxsLFxuXHRcdGhhc0RlbGltaXRlcjogdHJ1ZSxcblx0XHRoYXNUb3BBeGlzOiB0cnVlLFxuXHRcdGhhc0JvdHRvbUF4aXM6IGZ1bmN0aW9uIChkYXRhKSB7XG5cdFx0ICByZXR1cm4gZGF0YS5sZW5ndGggPj0gMTA7XG5cdFx0fSxcblx0XHRldmVudExpbmVDb2xvcjogJ2JsYWNrJyxcblx0XHRldmVudENvbG9yOiBudWxsXG4gIH07XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIGV2ZW50RHJvcHMoY29uZmlnKSB7XG5cdFx0dmFyIHhTY2FsZSA9IGQzLnRpbWUuc2NhbGUoKTtcblx0XHR2YXIgeVNjYWxlID0gZDMuc2NhbGUub3JkaW5hbCgpO1xuXHRcdGNvbmZpZyA9IGNvbmZpZyB8fCB7fTtcblx0XHRmb3IgKHZhciBrZXkgaW4gZGVmYXVsdENvbmZpZykge1xuXHRcdCAgY29uZmlnW2tleV0gPSBjb25maWdba2V5XSB8fCBkZWZhdWx0Q29uZmlnW2tleV07XG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gZXZlbnREcm9wR3JhcGgoc2VsZWN0aW9uKSB7XG5cdFx0ICBzZWxlY3Rpb24uZWFjaChmdW5jdGlvbiAoZGF0YSkge1xuXG5cdFx0ICBcdC8vd2luZG93LnJlcXVlc3RBbmltRnJhbWUgPSAoZnVuY3Rpb24oKXtcblx0XHQgICAgLy8gIHJldHVybiAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSAgICAgICB8fFxuXHRcdCAgICAvLyAgICAgICAgICB3aW5kb3cud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG5cdFx0ICAgIC8vICAgICAgICAgIHdpbmRvdy5tb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgICAgfHxcblx0XHQgICAgLy8gICAgICAgICAgd2luZG93Lm9SZXF1ZXN0QW5pbWF0aW9uRnJhbWUgICAgICB8fFxuXHRcdCAgICAvLyAgICAgICAgICB3aW5kb3cubXNSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgICAgIHx8XG5cdFx0ICAgIC8vICAgICAgICAgIGZ1bmN0aW9uKC8qIGZ1bmN0aW9uICovIGNhbGxiYWNrLCAvKiBET01FbGVtZW50ICovIGVsZW1lbnQpIHtcblx0XHQgICAgLy8gICAgICAgICAgICB3aW5kb3cuc2V0VGltZW91dChjYWxsYmFjaywgMTAwMCAvIDYwKTtcblx0XHQgICAgLy8gICAgICAgICAgfTtcblx0ICAgIFx0Ly99KSgpO1xuXG5cdFx0XHRcdHZhciB6b29tID0gZDMuYmVoYXZpb3Iuem9vbSgpLmNlbnRlcihudWxsKS5zY2FsZUV4dGVudChbY29uZmlnLm1pblNjYWxlLCBjb25maWcubWF4U2NhbGVdKS5vbihcInpvb21cIiwgdXBkYXRlWm9vbSk7XG5cblx0XHRcdFx0em9vbS5vbihcInpvb21lbmRcIiwgem9vbUVuZCk7XG4gICAgICAgIHpvb20ub24oXCJ6b29tc3RhcnRcIiwgem9vbVN0YXJ0KTtcblxuICAgICAgICB2YXIgZ3JhcGhXaWR0aCA9IGNvbmZpZy53aWR0aCAtIGNvbmZpZy5tYXJnaW4ucmlnaHQgLSBjb25maWcubWFyZ2luLmxlZnQ7XG4gICAgICAgIHZhciBncmFwaEhlaWdodCA9IGRhdGEubGVuZ3RoICogNDA7XG4gICAgICAgIHZhciBoZWlnaHQgPSBncmFwaEhlaWdodCArIGNvbmZpZy5tYXJnaW4udG9wICsgY29uZmlnLm1hcmdpbi5ib3R0b207XG4gICAgICAgIHZhciB4QXhpc1RvcCwgeEF4aXNCb3R0b207XG5cbiAgICAgICAgdmFyIGNhbnZhc193aWR0aCA9IGdyYXBoV2lkdGg7XG4gICAgICAgIHZhciBjYW52YXNfaGVpZ2h0ID0gZ3JhcGhIZWlnaHQ7XG5cbiAgICAgICAgdmFyIGxhc3RYID0gZ3JhcGhXaWR0aC8yO1xuICAgICAgICB2YXIgbGFzdFkgPSBncmFwaEhlaWdodC8yO1xuICAgICAgICB2YXIgZHJhZ2dlZCwgZHJhZ1N0YXJ0O1xuICAgICAgICB2YXIgbW91c2VEb3duID0gMDtcblxuICAgICAgICBkMy5zZWxlY3QodGhpcykuc2VsZWN0KCdjYW52YXMnKS5yZW1vdmUoKTtcbiAgICBcdFx0dmFyIGNhbnZhcyA9IGQzLnNlbGVjdCh0aGlzKVxuICAgIFx0XHQgIC5hcHBlbmQoJ2NhbnZhcycpXG4gICAgXHRcdCAgLmF0dHIoJ2lkJywgXCJtb25fY2FudmFzXCIpXG4gICAgXHRcdCAgLmF0dHIoJ3dpZHRoJywgY2FudmFzX3dpZHRoKVxuICAgIFx0XHQgIC5hdHRyKCdoZWlnaHQnLCBjYW52YXNfaGVpZ2h0KTtcblxuICAgICAgICB2YXIgYmFzZSA9IGQzLnNlbGVjdCh0aGlzKTtcblxuICBcdFx0ICB2YXIgY3R4ID0gKGNhbnZhcy5ub2RlKCkpLmdldENvbnRleHQoJzJkJyk7XG5cbiAgICAgICAgdmFyIGV2ZW50TGluZSA9IHJlcXVpcmUoJy4vZXZlbnRMaW5lJykoZDMsIGN0eCk7XG5cbiAgXHRcdFx0ZnVuY3Rpb24gZHJhd0FnYWluKCl7XG4gIFx0XHRcdCAgLy8gQ2xlYXIgdGhlIGVudGlyZSBjYW52YXNcbiAgXHRcdFx0ICB2YXIgdG9wWCA9IDA7XG4gIFx0XHRcdCAgdmFyIHRvcFkgPSAwO1xuICBcdFx0XHQgIGN0eC5jbGVhclJlY3QodG9wWCwgdG9wWSwgdG9wWCArIGNhbnZhcy5ub2RlKCkud2lkdGgsIHRvcFkgKyBjYW52YXMubm9kZSgpLmhlaWdodCk7XG5cbiAgXHRcdFx0fVxuXG4gIFx0XHRcdC8vIGRyYXcgdGhlIGNhbnZhcyBmb3IgdGhlIGZpcnN0IHRpbWVcblxuICBcdFx0XHRkcmF3QWdhaW4oKTtcblxuICAgICAgICBjYW52YXMubm9kZSgpLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIGZ1bmN0aW9uIChldnQpIHtcbiAgICAgICAgICAvLyBwZXJtaXRzIGNvbXBhdGliaWxpdHkgd2l0aCBldmVyeSBicm93c2VyXG4gICAgICAgICAgZG9jdW1lbnQuYm9keS5zdHlsZS5tb3pVc2VyU2VsZWN0ID0gZG9jdW1lbnQuYm9keS5zdHlsZS53ZWJraXRVc2VyU2VsZWN0ID0gZG9jdW1lbnQuYm9keS5zdHlsZS51c2VyU2VsZWN0ID0gJ25vbmUnO1xuICAgICAgICAgIGxhc3RYID0gZXZ0LmNsaWVudFg7XG4gICAgICAgICAgZHJhZ1N0YXJ0ID0ge1xuICAgICAgICAgICAgeCA6IGxhc3RYLFxuICAgICAgICAgICAgeSA6IGxhc3RZXG4gICAgICAgICAgfTtcbiAgICAgICAgICBkcmFnZ2VkID0gZmFsc2U7XG4gICAgICAgICAgbW91c2VEb3duKys7XG4gICAgICAgIH0sZmFsc2UpO1xuXG4gICAgICAgIGNhbnZhcy5ub2RlKCkuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgZnVuY3Rpb24gKGV2dCkge1xuICAgICAgICAgIGxhc3RYID0gZXZ0LmNsaWVudFg7XG4gICAgICAgICAgZHJhZ2dlZCA9IHRydWU7XG4gICAgICAgICAgaWYgKGRyYWdTdGFydCAmJiBtb3VzZURvd24pe1xuICAgICAgICAgICAgY3R4LnRyYW5zbGF0ZShsYXN0WC1kcmFnU3RhcnQueCwgbGFzdFktZHJhZ1N0YXJ0LnkpO1xuICAgICAgICAgICAgZHJhd0FnYWluKCk7XG4gICAgICAgICAgICByZWRyYXcoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sZmFsc2UpO1xuXG4gICAgICAgIGNhbnZhcy5ub2RlKCkuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIGZ1bmN0aW9uIChldnQpIHtcbiAgICAgICAgICBkcmFnU3RhcnQgPSBudWxsO1xuICAgICAgICAgIG1vdXNlRG93bi0tO1xuICAgICAgICAgIGlmICghZHJhZ2dlZCkgem9vbShldnQuc2hpZnRLZXkgPyAtMSA6IDEgKTtcbiAgICAgICAgfSxmYWxzZSk7XG5cbiAgICAgICAgZDMuc2VsZWN0KHRoaXMpLnNlbGVjdCgnc3ZnJykucmVtb3ZlKCk7XG5cbiAgICAgICAgdmFyIHN2ZyA9IGQzLnNlbGVjdCh0aGlzKVxuICAgICAgICAgIC5hcHBlbmQoJ3N2ZycpXG4gICAgICAgICAgLmF0dHIoJ3dpZHRoJywgY29uZmlnLndpZHRoKVxuICAgICAgICAgIC5hdHRyKCdoZWlnaHQnLCBoZWlnaHQpXG4gICAgICAgIDtcblxuICAgICAgICB2YXIgZ3JhcGggPSBzdmcuYXBwZW5kKCdnJylcbiAgICAgICAgICAuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgwLCAyNSknKTtcblxuICAgICAgICB2YXIgeURvbWFpbiA9IFtdO1xuICAgICAgICB2YXIgeVJhbmdlID0gW107XG5cbiAgICAgICAgZGF0YS5mb3JFYWNoKGZ1bmN0aW9uIChldmVudCwgaW5kZXgpIHtcbiAgICAgICAgICB5RG9tYWluLnB1c2goZXZlbnQubmFtZSk7XG4gICAgICAgICAgeVJhbmdlLnB1c2goaW5kZXggKiA0MCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHlTY2FsZS5kb21haW4oeURvbWFpbikucmFuZ2UoeVJhbmdlKTtcblxuICAgICAgICB2YXIgeUF4aXNFbCA9IGdyYXBoLmFwcGVuZCgnZycpXG4gICAgICAgICAgLmNsYXNzZWQoJ3ktYXhpcycsIHRydWUpXG4gICAgICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoMCwgNjApJyk7XG5cbiAgICAgICAgdmFyIHlUaWNrID0geUF4aXNFbC5hcHBlbmQoJ2cnKS5zZWxlY3RBbGwoJ2cnKS5kYXRhKHlEb21haW4pO1xuXG4gICAgICAgIHlUaWNrLmVudGVyKClcbiAgICAgICAgICAuYXBwZW5kKCdnJylcbiAgICAgICAgICAuYXR0cigndHJhbnNmb3JtJywgZnVuY3Rpb24oZCkge1xuICAgICAgICAgICAgcmV0dXJuICd0cmFuc2xhdGUoMCwgJyArIHlTY2FsZShkKSArICcpJztcbiAgICAgICAgICB9KVxuICAgICAgICAgIC5hcHBlbmQoJ2xpbmUnKVxuICAgICAgICAgIC5jbGFzc2VkKCd5LXRpY2snLCB0cnVlKVxuICAgICAgICAgIC5hdHRyKCd4MScsIGNvbmZpZy5tYXJnaW4ubGVmdClcbiAgICAgICAgICAuYXR0cigneDInLCBjb25maWcubWFyZ2luLmxlZnQgKyBncmFwaFdpZHRoKTtcblxuICAgICAgICB5VGljay5leGl0KCkucmVtb3ZlKCk7XG5cbiAgICAgICAgdmFyIGN1cngsIGN1cnk7XG4gICAgICAgIHZhciB6b29tUmVjdCA9IHN2Z1xuICAgICAgICAgIC5hcHBlbmQoJ3JlY3QnKVxuICAgICAgICAgIC5jYWxsKHpvb20pXG4gICAgICAgICAgLmNsYXNzZWQoJ3pvb20nLCB0cnVlKVxuICAgICAgICAgIC5hdHRyKCd3aWR0aCcsIGdyYXBoV2lkdGgpXG4gICAgICAgICAgLmF0dHIoJ2hlaWdodCcsIGhlaWdodCApXG4gICAgICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoJyArIGNvbmZpZy5tYXJnaW4ubGVmdCArICcsIDM1KScpXG4gICAgICAgIDtcblxuICAgICAgICBpZiAodHlwZW9mIGNvbmZpZy5ldmVudEhvdmVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgem9vbVJlY3Qub24oJ21vdXNlbW92ZScsIGZ1bmN0aW9uKGQsIGUpIHtcbiAgICAgICAgICAgIHZhciBldmVudCA9IGQzLmV2ZW50O1xuICAgICAgICAgICAgaWYgKGN1cnggPT0gZXZlbnQuY2xpZW50WCAmJiBjdXJ5ID09IGV2ZW50LmNsaWVudFkpIHJldHVybjtcbiAgICAgICAgICAgIGN1cnggPSBldmVudC5jbGllbnRYO1xuICAgICAgICAgICAgY3VyeSA9IGV2ZW50LmNsaWVudFk7XG4gICAgICAgICAgICB6b29tUmVjdC5hdHRyKCdkaXNwbGF5JywgJ25vbmUnKTtcbiAgICAgICAgICAgIHZhciBlbCA9IGRvY3VtZW50LmVsZW1lbnRGcm9tUG9pbnQoZDMuZXZlbnQuY2xpZW50WCwgZDMuZXZlbnQuY2xpZW50WSk7XG4gICAgICAgICAgICB6b29tUmVjdC5hdHRyKCdkaXNwbGF5JywgJ2Jsb2NrJyk7XG4gICAgICAgICAgICBpZiAoZWwudGFnTmFtZSAhPT0gJ2NpcmNsZScpIHJldHVybjtcbiAgICAgICAgICAgIGNvbmZpZy5ldmVudEhvdmVyKGVsKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0eXBlb2YgY29uZmlnLmV2ZW50Q2xpY2sgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICB6b29tUmVjdC5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB6b29tUmVjdC5hdHRyKCdkaXNwbGF5JywgJ25vbmUnKTtcbiAgICAgICAgICAgIHZhciBlbCA9IGRvY3VtZW50LmVsZW1lbnRGcm9tUG9pbnQoZDMuZXZlbnQuY2xpZW50WCwgZDMuZXZlbnQuY2xpZW50WSk7XG4gICAgICAgICAgICB6b29tUmVjdC5hdHRyKCdkaXNwbGF5JywgJ2Jsb2NrJyk7XG4gICAgICAgICAgICBpZiAoZWwudGFnTmFtZSAhPT0gJ2NpcmNsZScpIHJldHVybjtcbiAgICAgICAgICAgIGNvbmZpZy5ldmVudENsaWNrKGVsKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHhTY2FsZS5yYW5nZShbMCwgZ3JhcGhXaWR0aF0pLmRvbWFpbihbY29uZmlnLnN0YXJ0LCBjb25maWcuZW5kXSk7XG5cbiAgICAgICAgem9vbS54KHhTY2FsZSk7XG5cbiAgICAgICAgdmFyIGNvb3JYX3N0YXJ0O1xuXG4gICAgICAgIHZhciBjb29yWF9lbmQ7XG5cbiAgICAgICAgdmFyIGNvdW50ID0gMDtcblxuICAgICAgICBmdW5jdGlvbiB0cmFuc2xhdGVDYW52YXMoeCwgeSkge1xuICAgICAgICAgIGN0eC50cmFuc2xhdGUoeSAtIHgsIDApO1xuICAgICAgICAgIHJldHVybiB5O1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gem9vbVN0YXJ0KCkge1xuICAgICAgICAgIGlmIChkMy5ldmVudC5zb3VyY2VFdmVudC50b1N0cmluZygpID09PSAnW29iamVjdCBNb3VzZUV2ZW50XScpIHtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coZDMubW91c2UodGhpcylbMF0pO1xuICAgICAgICAgICAgY29vclhfc3RhcnQgPSBkMy5tb3VzZSh0aGlzKVswXTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiB1cGRhdGVab29tKCkge1xuICAgICAgICAgIGlmIChkMy5ldmVudC5zb3VyY2VFdmVudCAmJiBkMy5ldmVudC5zb3VyY2VFdmVudC50b1N0cmluZygpID09PSAnW29iamVjdCBNb3VzZUV2ZW50XScpIHtcbiAgICAgICAgICAgIHpvb20udHJhbnNsYXRlKFtkMy5ldmVudC50cmFuc2xhdGVbMF0sIDBdKTtcbiAgICAgICAgICAgIGNvb3JYX3N0YXJ0ID0gdHJhbnNsYXRlQ2FudmFzKGNvb3JYX3N0YXJ0LCBkMy5tb3VzZSh0aGlzKVswXSk7XG4gICAgICAgICAgICBjb29yWF9zdGFydCA9IGQzLm1vdXNlKHRoaXMpWzBdO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChkMy5ldmVudC5zb3VyY2VFdmVudCAmJiBkMy5ldmVudC5zb3VyY2VFdmVudC50b1N0cmluZygpID09PSAnW29iamVjdCBXaGVlbEV2ZW50XScpIHtcbiAgICAgICAgICAgIHpvb20uc2NhbGUoZDMuZXZlbnQuc2NhbGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvL2RyYXdBZ2FpbigpO1xuICAgICAgICAgIHJlZHJhdygpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gaW5pdGlhbGl6YXRpb24gb2YgdGhlIGRlbGltaXRlclxuICAgICAgICBzdmcuc2VsZWN0KCcuZGVsaW1pdGVyJykucmVtb3ZlKCk7XG4gICAgICAgIHZhciBkZWxpbWl0ZXJFbCA9IHN2Z1xuICAgICAgICAgIC5hcHBlbmQoJ2cnKVxuICAgICAgICAgIC5jbGFzc2VkKCdkZWxpbWl0ZXInLCB0cnVlKVxuICAgICAgICAgIC5hdHRyKCd3aWR0aCcsIGdyYXBoV2lkdGgpXG4gICAgICAgICAgLmF0dHIoJ2hlaWdodCcsIDEwKVxuICAgICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCcgKyBjb25maWcubWFyZ2luLmxlZnQgKyAnLCAnICsgKGNvbmZpZy5tYXJnaW4udG9wIC0gNDUpICsgJyknKVxuICAgICAgICAgIC5jYWxsKGRlbGltaXRlcih7XG4gICAgICAgICAgICB4U2NhbGU6IHhTY2FsZSxcbiAgICAgICAgICAgIGRhdGVGb3JtYXQ6IGNvbmZpZy5sb2NhbGUgPyBjb25maWcubG9jYWxlLnRpbWVGb3JtYXQoXCIlZCAlQiAlWVwiKSA6IGQzLnRpbWUuZm9ybWF0KFwiJWQgJUIgJVlcIilcbiAgICAgICAgICB9KSlcbiAgICAgICAgO1xuXG4gICAgICAgIGZ1bmN0aW9uIHJlZHJhd0RlbGltaXRlcigpIHtcbiAgICAgICAgICBkZWxpbWl0ZXJFbC5jYWxsKGRlbGltaXRlcih7XG4gICAgICAgICAgICB4U2NhbGU6IHhTY2FsZSxcbiAgICAgICAgICAgIGRhdGVGb3JtYXQ6IGNvbmZpZy5sb2NhbGUgPyBjb25maWcubG9jYWxlLnRpbWVGb3JtYXQoXCIlZCAlQiAlWVwiKSA6IGQzLnRpbWUuZm9ybWF0KFwiJWQgJUIgJVlcIilcbiAgICAgICAgICB9KSk7XG4gICAgICAgIH1cblxuICBcdFx0XHRmdW5jdGlvbiB6b29tRW5kKCkge1xuICBcdFx0XHQgIGlmIChjb25maWcuZXZlbnRab29tKSB7XG4gIFx0XHRcdFx0ICBjb25maWcuZXZlbnRab29tKHhTY2FsZSk7XG4gIFx0XHRcdCAgfVxuICBcdFx0XHQgIGlmIChjb25maWcuaGFzRGVsaW1pdGVyKSB7XG4gIFx0XHRcdFx0ICByZWRyYXdEZWxpbWl0ZXIoKTtcbiAgXHRcdFx0ICB9XG4gICAgICAgICAgaWYgKGQzLmV2ZW50LnNvdXJjZUV2ZW50LnRvU3RyaW5nKCkgPT09ICdbb2JqZWN0IE1vdXNlRXZlbnRdJykge1xuICAgICAgICAgICAgY29vclhfZW5kID0gZDMubW91c2UodGhpcylbMF07XG4gICAgICAgICAgICBjdHgudHJhbnNsYXRlKGNvb3JYX2VuZCAtIGNvb3JYX3N0YXJ0LCAwKTtcbiAgICAgICAgICAgIC8vZHJhd0FnYWluKCk7XG4gICAgICAgICAgfVxuICBcdFx0XHR9XG5cbiAgICAgICAgdmFyIGhhc1RvcEF4aXMgPSB0eXBlb2YgY29uZmlnLmhhc1RvcEF4aXMgPT09ICdmdW5jdGlvbicgPyBjb25maWcuaGFzVG9wQXhpcyhkYXRhKSA6IGNvbmZpZy5oYXNUb3BBeGlzO1xuICAgICAgICBpZiAoaGFzVG9wQXhpcykge1xuICAgICAgICAgIHhBeGlzVG9wID0geEF4aXNGYWN0b3J5KGQzLCBjb25maWcsIHhTY2FsZSwgZ3JhcGgsIGdyYXBoSGVpZ2h0LCAndG9wJyk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgaGFzQm90dG9tQXhpcyA9IHR5cGVvZiBjb25maWcuaGFzQm90dG9tQXhpcyA9PT0gJ2Z1bmN0aW9uJyA/IGNvbmZpZy5oYXNCb3R0b21BeGlzKGRhdGEpIDogY29uZmlnLmhhc0JvdHRvbUF4aXM7XG4gICAgICAgIGlmIChoYXNCb3R0b21BeGlzKSB7XG4gICAgICAgICAgeEF4aXNCb3R0b20gPSB4QXhpc0ZhY3RvcnkoZDMsIGNvbmZpZywgeFNjYWxlLCBncmFwaCwgZ3JhcGhIZWlnaHQsICdib3R0b20nKTtcbiAgICAgICAgfVxuXG4gIFx0XHRcdGZ1bmN0aW9uIGRyYXdYQXhpcyh3aGVyZSkge1xuXG4gIFx0XHRcdCAgLy8gY29weSBjb25maWcudGlja0Zvcm1hdCBiZWNhdXNlIGQzIGZvcm1hdC5tdWx0aSBlZGl0IGl0cyBnaXZlbiB0aWNrRm9ybWF0IGRhdGFcbiAgXHRcdFx0ICB2YXIgdGlja0Zvcm1hdERhdGEgPSBbXTtcblxuICBcdFx0XHQgIGNvbmZpZy50aWNrRm9ybWF0LmZvckVhY2goZnVuY3Rpb24gKGl0ZW0pIHtcbiAgXHRcdFx0XHR2YXIgdGljayA9IGl0ZW0uc2xpY2UoMCk7XG4gIFx0XHRcdFx0dGlja0Zvcm1hdERhdGEucHVzaCh0aWNrKTtcbiAgXHRcdFx0ICB9KTtcblxuICBcdFx0XHQgIHZhciB0aWNrRm9ybWF0ID0gY29uZmlnLmxvY2FsZSA/IGNvbmZpZy5sb2NhbGUudGltZUZvcm1hdC5tdWx0aSh0aWNrRm9ybWF0RGF0YSkgOiBkMy50aW1lLmZvcm1hdC5tdWx0aSh0aWNrRm9ybWF0RGF0YSk7XG4gIFx0XHRcdCAgdmFyIHhBeGlzID0gZDMuc3ZnLmF4aXMoKVxuICBcdFx0XHRcdC5zY2FsZSh4U2NhbGUpXG4gIFx0XHRcdFx0Lm9yaWVudCh3aGVyZSlcbiAgXHRcdFx0XHQudGlja0Zvcm1hdCh0aWNrRm9ybWF0KVxuICBcdFx0XHQgIDtcblxuICBcdFx0XHQgIGlmICh0eXBlb2YgY29uZmlnLmF4aXNGb3JtYXQgPT09ICdmdW5jdGlvbicpIHtcbiAgXHRcdFx0XHRjb25maWcuYXhpc0Zvcm1hdCh4QXhpcyk7XG4gIFx0XHRcdCAgfVxuXG4gIFx0XHRcdCAgdmFyIHkgPSAod2hlcmUgPT0gJ2JvdHRvbScgPyBwYXJzZUludChncmFwaEhlaWdodCkgOiAwKSArIGNvbmZpZy5tYXJnaW4udG9wIC0gNDA7XG5cbiAgXHRcdFx0ICBncmFwaC5zZWxlY3QoJy54LWF4aXMuJyArIHdoZXJlKS5yZW1vdmUoKTtcbiAgXHRcdFx0ICB2YXIgeEF4aXNFbCA9IGdyYXBoXG4gIFx0XHRcdFx0LmFwcGVuZCgnZycpXG4gIFx0XHRcdFx0LmNsYXNzZWQoJ3gtYXhpcycsIHRydWUpXG4gIFx0XHRcdFx0LmNsYXNzZWQod2hlcmUsIHRydWUpXG4gIFx0XHRcdFx0LmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoJyArIGNvbmZpZy5tYXJnaW4ubGVmdCArICcsICcgKyB5ICsgJyknKVxuICBcdFx0XHRcdC5jYWxsKHhBeGlzKVxuICBcdFx0XHQgIDtcbiAgXHRcdFx0fVxuXG4gIFx0XHRcdC8vIGluaXRpYWxpemF0aW9uIG9mIHRoZSBncmFwaCBib2R5XG4gICAgICAgIHpvb20uc2l6ZShbY29uZmlnLndpZHRoLCBoZWlnaHRdKTtcblxuICAgICAgICBncmFwaC5zZWxlY3QoJy5ncmFwaC1ib2R5JykucmVtb3ZlKCk7XG4gICAgICAgIHZhciBncmFwaEJvZHkgPSBncmFwaFxuICAgICAgICAgIC5hcHBlbmQoJ2cnKVxuICAgICAgICAgIC5jbGFzc2VkKCdncmFwaC1ib2R5JywgdHJ1ZSlcbiAgICAgICAgICAuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgnICsgY29uZmlnLm1hcmdpbi5sZWZ0ICsgJywgJyArIChjb25maWcubWFyZ2luLnRvcCAtIDE1KSArICcpJyk7XG5cbiAgICAgICAgdmFyIGxpbmVzID0gZ3JhcGhCb2R5LnNlbGVjdEFsbCgnZycpLmRhdGEoZGF0YSk7XG5cbiAgICAgICAgbGluZXMuZW50ZXIoKVxuICAgICAgICAgIC5hcHBlbmQoJ2cnKVxuICAgICAgICAgIC5jbGFzc2VkKCdsaW5lJywgdHJ1ZSlcbiAgICAgICAgICAuYXR0cigndHJhbnNmb3JtJywgZnVuY3Rpb24oZCkge1xuICAgICAgICAgICAgcmV0dXJuICd0cmFuc2xhdGUoMCwnICsgeVNjYWxlKGQubmFtZSkgKyAnKSc7XG4gICAgICAgICAgfSlcbiAgICAgICAgICAuc3R5bGUoJ2ZpbGwnLCBjb25maWcuZXZlbnRMaW5lQ29sb3IpXG4gICAgICAgICAgLmNhbGwoZXZlbnRMaW5lKHsgeFNjYWxlOiB4U2NhbGUsIGV2ZW50Q29sb3I6IGNvbmZpZy5ldmVudENvbG9yIH0pKVxuICAgICAgICA7XG5cbiAgICAgICAgbGluZXMuZXhpdCgpLnJlbW92ZSgpO1xuXG4gICAgICAgIGZ1bmN0aW9uIHJlZHJhdygpIHtcbiAgICAgICAgICB2YXIgaGFzVG9wQXhpcyA9IHR5cGVvZiBjb25maWcuaGFzVG9wQXhpcyA9PT0gJ2Z1bmN0aW9uJyA/IGNvbmZpZy5oYXNUb3BBeGlzKGRhdGEpIDogY29uZmlnLmhhc1RvcEF4aXM7XG4gICAgICAgICAgaWYgKGhhc1RvcEF4aXMpIHtcbiAgICAgICAgICAgIHhBeGlzVG9wLmRyYXdYQXhpcygpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHZhciBoYXNCb3R0b21BeGlzID0gdHlwZW9mIGNvbmZpZy5oYXNCb3R0b21BeGlzID09PSAnZnVuY3Rpb24nID8gY29uZmlnLmhhc0JvdHRvbUF4aXMoZGF0YSkgOiBjb25maWcuaGFzQm90dG9tQXhpcztcbiAgICAgICAgICBpZiAoaGFzQm90dG9tQXhpcykge1xuICAgICAgICAgICAgeEF4aXNCb3R0b20uZHJhd1hBeGlzKCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbGluZXMuY2FsbChldmVudExpbmUoeyB4U2NhbGU6IHhTY2FsZSwgeVNjYWxlOiB5U2NhbGUsIGV2ZW50TGluZUNvbG9yOiBjb25maWcuZXZlbnRMaW5lQ29sb3IsIGV2ZW50Q29sb3I6IGNvbmZpZy5ldmVudENvbG9yIH0pKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJlZHJhdygpO1xuICAgICAgICBpZiAoY29uZmlnLmhhc0RlbGltaXRlcikge1xuICAgICAgICAgIHJlZHJhd0RlbGltaXRlcih4U2NhbGUpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjb25maWcuZXZlbnRab29tKSB7XG4gICAgICAgICAgY29uZmlnLmV2ZW50Wm9vbSh4U2NhbGUpO1xuICAgICAgICB9XG4gICAgfSk7XG4gIH1cblx0Y29uZmlndXJhYmxlKGV2ZW50RHJvcEdyYXBoLCBjb25maWcpO1xuXHRyZXR1cm4gZXZlbnREcm9wR3JhcGg7XG4gIH07XG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vKiBnbG9iYWwgcmVxdWlyZSwgbW9kdWxlLCBkMyAqL1xuXG52YXIgY29uZmlndXJhYmxlID0gcmVxdWlyZSgnLi91dGlsL2NvbmZpZ3VyYWJsZScpO1xudmFyIGZpbHRlckRhdGEgPSByZXF1aXJlKCcuL2ZpbHRlckRhdGEnKTtcblxudmFyIGRlZmF1bHRDb25maWcgPSB7XG4gIHhTY2FsZTogbnVsbCxcbiAgeVNjYWxlOiBudWxsXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChkMywgY29udGV4dCkge1xuICByZXR1cm4gZnVuY3Rpb24gKGNvbmZpZykge1xuXG4gICAgY29uZmlnID0gY29uZmlnIHx8IHtcbiAgICAgIHhTY2FsZTogbnVsbCxcbiAgICAgIHlTY2FsZTogbnVsbCxcbiAgICAgIGV2ZW50TGluZUNvbG9yOiAnYmxhY2snXG4gICAgfTtcbiAgICBmb3IgKHZhciBrZXkgaW4gZGVmYXVsdENvbmZpZykge1xuICAgICAgY29uZmlnW2tleV0gPSBjb25maWdba2V5XSB8fCBkZWZhdWx0Q29uZmlnW2tleV07XG4gICAgfVxuXG4gICAgdmFyIGV2ZW50TGluZSA9IGZ1bmN0aW9uIGV2ZW50TGluZShzZWxlY3Rpb24pIHtcbiAgICAgIHNlbGVjdGlvbi5lYWNoKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgIHZhciBuYW1lTGluZSA9IGRhdGEubmFtZTtcbiAgICAgICAgZDMuc2VsZWN0KHRoaXMpLnNlbGVjdEFsbCgndGV4dCcpLnJlbW92ZSgpO1xuXG4gICAgICAgIGQzLnNlbGVjdCh0aGlzKS5hcHBlbmQoJ3RleHQnKVxuICAgICAgICAgIC50ZXh0KGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICAgIHZhciBjb3VudCA9IGZpbHRlckRhdGEoZC5kYXRlcywgY29uZmlnLnhTY2FsZSkubGVuZ3RoO1xuICAgICAgICAgICAgcmV0dXJuIGQubmFtZSArIChjb3VudCA+IDAgPyAnICgnICsgY291bnQgKyAnKScgOiAnJyk7XG4gICAgICAgICAgfSlcbiAgICAgICAgICAuYXR0cigndGV4dC1hbmNob3InLCAnZW5kJylcbiAgICAgICAgICAuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgtMjApJylcbiAgICAgICAgICAuc3R5bGUoJ2ZpbGwnLCAnYmxhY2snKVxuICAgICAgICA7XG5cbiAgICAgICAgdmFyIGRhdGFDb250YWluZXIgPSBkMy5zZWxlY3QoXCJib2R5XCIpLmFwcGVuZCgnY3VzdG9tJyk7XG5cbiAgICAgICAgZnVuY3Rpb24gZHJhd0N1c3RvbSAoZGF0YSkge1xuICAgICAgICAgIHZhciBkYXRlcyA9IGZpbHRlckRhdGEoZGF0YS5kYXRlcywgY29uZmlnLnhTY2FsZSk7XG4gICAgICAgICAgdmFyIHkgPSAwO1xuICAgICAgICAgIGlmICh0eXBlb2YgY29uZmlnLnlTY2FsZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgeSA9IGNvbmZpZy55U2NhbGUoZGF0YS5uYW1lKSArIDI1O1xuICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgeSA9IGNvbmZpZy55U2NhbGUgKyAyNTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdmFyIGNvbG9yID0gJ2JsYWNrJztcbiAgICAgICAgICBpZiAoY29uZmlnLmV2ZW50TGluZUNvbG9yKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGNvbmZpZy5ldmVudExpbmVDb2xvciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICBjb2xvciA9IGNvbmZpZy5ldmVudExpbmVDb2xvcihkYXRhLCBkYXRhLm5hbWUpO1xuICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgIGNvbG9yID0gY29uZmlnLmV2ZW50TGluZUNvbG9yO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChjb250ZXh0KSB7XG4gICAgICAgICAgICBkcmF3TGluZShkYXRlcywgeSwgY29sb3IsIGNvbnRleHQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGRyYXdMaW5lKGRhdGVzLCB5LCBjb2xvciwgY29udGV4dCkge1xuICAgICAgICAgIGRhdGVzLmZvckVhY2goZnVuY3Rpb24oZGF0ZSkge1xuICAgICAgICAgICAgY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICAgICAgICAgIGNvbnRleHQuZmlsbFN0eWxlID0gY29sb3I7XG4gICAgICAgICAgICBjb250ZXh0LmFyYyhjb25maWcueFNjYWxlKGRhdGUpLCB5LCAxMCwgMCwgMiAqIE1hdGguUEkpO1xuICAgICAgICAgICAgY29udGV4dC5maWxsKCk7XG4gICAgICAgICAgICBjb250ZXh0LmNsb3NlUGF0aCgpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgZHJhd0N1c3RvbShkYXRhKTtcblxuXG4gICAgICAgIC8qZDMuc2VsZWN0KHRoaXMpLnNlbGVjdEFsbCgnY2lyY2xlJykucmVtb3ZlKCk7XG5cbiAgICAgICAgdmFyIGNpcmNsZSA9IGQzLnNlbGVjdCh0aGlzKS5zZWxlY3RBbGwoJ2NpcmNsZScpXG4gICAgICAgICAgLmRhdGEoZnVuY3Rpb24oZCkge1xuICAgICAgICAgICAgLy8gZmlsdGVyIHZhbHVlIG91dHNpZGUgb2YgcmFuZ2VcbiAgICAgICAgICAgIHJldHVybiBmaWx0ZXJEYXRhKGQuZGF0ZXMsIGNvbmZpZy54U2NhbGUpO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgIGNpcmNsZS5lbnRlcigpXG4gICAgICAgICAgLmFwcGVuZCgnY2lyY2xlJylcbiAgICAgICAgICAuYXR0cignY3gnLCBmdW5jdGlvbihkKSB7XG4gICAgICAgICAgICByZXR1cm4gY29uZmlnLnhTY2FsZShkKTtcbiAgICAgICAgICB9KVxuICAgICAgICAgIC5zdHlsZSgnZmlsbCcsIGNvbmZpZy5ldmVudENvbG9yKVxuICAgICAgICAgIC5hdHRyKCdjeScsIC01KVxuICAgICAgICAgIC5hdHRyKCdyJywgMTApXG4gICAgICAgIDtcblxuICAgICAgICBjaXJjbGUuZXhpdCgpLnJlbW92ZSgpOyovXG5cbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICBjb25maWd1cmFibGUoZXZlbnRMaW5lLCBjb25maWcpO1xuXG4gICAgcmV0dXJuIGV2ZW50TGluZTtcbiAgfTtcbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcbi8qIGdsb2JhbCBtb2R1bGUgKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBmaWx0ZXJEYXRlKGRhdGEsIHNjYWxlKSB7XG4gIGRhdGEgPSBkYXRhIHx8IFtdO1xuICB2YXIgYm91bmRhcnkgPSBzY2FsZS5yYW5nZSgpO1xuICB2YXIgbWluID0gYm91bmRhcnlbMF07XG4gIHZhciBtYXggPSBib3VuZGFyeVsxXTtcblxuICByZXR1cm4gZGF0YS5maWx0ZXIoZnVuY3Rpb24gKGRhdHVtKSB7XG4gICAgdmFyIHZhbHVlID0gc2NhbGUoZGF0dW0pO1xuICAgIHJldHVybiAhKHZhbHVlIDwgbWluIHx8IHZhbHVlID4gbWF4KTtcbiAgfSk7XG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vKiBnbG9iYWwgcmVxdWlyZSwgZGVmaW5lLCBtb2R1bGUgKi9cblxudmFyIGV2ZW50RHJvcHMgPSByZXF1aXJlKCcuL2V2ZW50RHJvcHMnKTtcblxuaWYgKHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kKSB7XG4gIGRlZmluZSgnZDMuY2hhcnQuZXZlbnREcm9wcycsIFtcImQzXCJdLCBmdW5jdGlvbiAoZDMpIHtcbiAgICBkMy5jaGFydCA9IGQzLmNoYXJ0IHx8IHt9O1xuICAgIGQzLmNoYXJ0LmV2ZW50RHJvcHMgPSBldmVudERyb3BzKGQzLCBkb2N1bWVudCk7XG4gIH0pO1xufSBlbHNlIGlmICh3aW5kb3cpIHtcbiAgd2luZG93LmQzLmNoYXJ0ID0gd2luZG93LmQzLmNoYXJ0IHx8IHt9O1xuICB3aW5kb3cuZDMuY2hhcnQuZXZlbnREcm9wcyA9IGV2ZW50RHJvcHMod2luZG93LmQzLCBkb2N1bWVudCk7XG59IGVsc2Uge1xuICBtb2R1bGUuZXhwb3J0cyA9IGV2ZW50RHJvcHM7XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNvbmZpZ3VyYWJsZSh0YXJnZXRGdW5jdGlvbiwgY29uZmlnLCBsaXN0ZW5lcnMpIHtcbiAgbGlzdGVuZXJzID0gbGlzdGVuZXJzIHx8IHt9O1xuICBmb3IgKHZhciBpdGVtIGluIGNvbmZpZykge1xuICAgIChmdW5jdGlvbihpdGVtKSB7XG4gICAgICB0YXJnZXRGdW5jdGlvbltpdGVtXSA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIGNvbmZpZ1tpdGVtXTtcbiAgICAgICAgY29uZmlnW2l0ZW1dID0gdmFsdWU7XG4gICAgICAgIGlmIChsaXN0ZW5lcnMuaGFzT3duUHJvcGVydHkoaXRlbSkpIHtcbiAgICAgICAgICBsaXN0ZW5lcnNbaXRlbV0odmFsdWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRhcmdldEZ1bmN0aW9uO1xuICAgICAgfTtcbiAgICB9KShpdGVtKTsgLy8gZm9yIGRvZXNuJ3QgY3JlYXRlIGEgY2xvc3VyZSwgZm9yY2luZyBpdFxuICB9XG59O1xuIiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGQzLCBjb25maWcsIHhTY2FsZSwgZ3JhcGgsIGdyYXBoSGVpZ2h0LCB3aGVyZSkge1xuICB2YXIgeEF4aXMgPSB7fTtcbiAgdmFyIHhBeGlzRWxzID0ge307XG5cbiAgdmFyIHRpY2tGb3JtYXREYXRhID0gW107XG5cbiAgY29uZmlnLnRpY2tGb3JtYXQuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSkge1xuICAgIHZhciB0aWNrID0gaXRlbS5zbGljZSgwKTtcbiAgICB0aWNrRm9ybWF0RGF0YS5wdXNoKHRpY2spO1xuICB9KTtcblxuICB2YXIgdGlja0Zvcm1hdCA9IGNvbmZpZy5sb2NhbGUgPyBjb25maWcubG9jYWxlLnRpbWVGb3JtYXQubXVsdGkodGlja0Zvcm1hdERhdGEpIDogZDMudGltZS5mb3JtYXQubXVsdGkodGlja0Zvcm1hdERhdGEpO1xuICB4QXhpc1t3aGVyZV0gPSBkMy5zdmcuYXhpcygpXG4gICAgLnNjYWxlKHhTY2FsZSlcbiAgICAub3JpZW50KHdoZXJlKVxuICAgIC50aWNrRm9ybWF0KHRpY2tGb3JtYXQpXG4gIDtcblxuICBpZiAodHlwZW9mIGNvbmZpZy5heGlzRm9ybWF0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgY29uZmlnLmF4aXNGb3JtYXQoeEF4aXMpO1xuICB9XG5cbiAgdmFyIHkgPSAod2hlcmUgPT0gJ2JvdHRvbScgPyBwYXJzZUludChncmFwaEhlaWdodCkgOiAwKSArIGNvbmZpZy5tYXJnaW4udG9wIC0gNDA7XG5cbiAgeEF4aXNFbHNbd2hlcmVdID0gZ3JhcGhcbiAgICAuYXBwZW5kKCdnJylcbiAgICAuY2xhc3NlZCgneC1heGlzJywgdHJ1ZSlcbiAgICAuY2xhc3NlZCh3aGVyZSwgdHJ1ZSlcbiAgICAuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgnICsgY29uZmlnLm1hcmdpbi5sZWZ0ICsgJywgJyArIHkgKyAnKScpXG4gICAgLmNhbGwoeEF4aXNbd2hlcmVdKVxuICA7XG5cbiAgdmFyIGRyYXdYQXhpcyA9IGZ1bmN0aW9uIGRyYXdYQXhpcygpIHtcbiAgICB4QXhpc0Vsc1t3aGVyZV1cbiAgICAgIC5jYWxsKHhBeGlzW3doZXJlXSlcbiAgICA7XG4gIH07XG5cbiAgcmV0dXJuIHtcbiAgICBkcmF3WEF4aXM6IGRyYXdYQXhpc1xuICB9O1xufTtcbiJdfQ==
