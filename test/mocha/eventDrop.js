"use strict";
var d3 = require('d3');
var assert = require('assert');
var document = require('jsdom').jsdom();

var filterData = require('../../lib/filterData');
var eventDrop = require('../../lib/eventDrop');

describe('eventDrop', function () {
  var graph, elements;

  var day = 1000 * 60 * 60 * 24;
  var now = Date.now();

  beforeEach(function () {
    graph = eventDrop({});
    var body = document.createElement('body');
    elements = d3.select(body).selectAll('div')
      .data([
        {name: 'nom1', dates: []},
        {name: 'nom2', dates: [new Date(now - 2 * day)]},
        {name: 'nom3', dates: [new Date(now - 1 * day), new Date(now)]}
      ])
      .enter().append('div')
    ;

    graph(elements);
  });

  it ('should append one svg element to all given element when called', function () {
    elements.each(function () {
      var svgs = d3.select(this).selectAll('svg')[0];
      assert.equal(svgs.length, 1);
    });
  });

  it ('should add a xscale to each element', function () {

  });

});
