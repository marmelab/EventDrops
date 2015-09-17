var THREE = require('three');

var filterData = require('../filterData');

module.exports = function (context, data, scene, config, width, height) {
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

  var Lines = require('./drawLines');

  if (context) {
    Lines(dateTab, y, color, scene, config, width, height);
  }
};

