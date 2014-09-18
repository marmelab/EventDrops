"use strict";

var eventDrop = require('./eventDrop');

if (typeof define === "function" && define.amd) {
  define('d3.chart.eventDrop', ["d3"], function (d3) {
    d3.chart = d3.chart || {};
    d3.chart.eventDrop = eventDrop(d3);
  });
} else if (window) {
  window.d3.chart = window.d3.chart || {};
  window.d3.chart.eventDrop = eventDrop(window.d3);
} else {
  module.exports = eventDrop;
}
