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
