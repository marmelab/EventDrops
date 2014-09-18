/*global d3 */
"use strict";

var eventDrop = require('./eventDrop');

if (typeof define === "function" && define.amd) {
  define('d3.chart.eventDrop', ["d3"], function (d3) {
    eventDrop(d3);
  });
} else {
  eventDrop(window.d3);
}

