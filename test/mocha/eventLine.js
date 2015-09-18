"use strict";
var d3 = require('d3');
var assert = require('assert');
var document = require('jsdom').jsdom();

var filterData = require('../../lib/filterData');
var eventLine = require('../../lib/eventLine')(d3);

describe('eventLine', function () {
  var graph, elements;

  var day = 1000 * 60 * 60 * 24;
  var now = Date.now();

  beforeEach(function () {
    graph = eventLine();
    graph.xScale(d3.time.scale()
      .range([0, 10000])
      .domain([new Date(now - 2 * day), new Date(now)]));
    var svg = document.createElement('svg');
    elements = d3.select(svg).selectAll('g')
      .data([
        {name: 'nom1', dates: []},
        {name: 'nom2', dates: [new Date(now - 2 * day)]},
        {name: 'nom3', dates: [new Date(now - 1 * day), new Date(now)]}
      ])
      .enter().append('g')
    ;
    graph(elements);
  });

  it('should add a text with data.name and number of dates if any to all its elements', function () {
    var texts = elements.selectAll('text');

    assert.equal(texts.length, 3);

    texts.each(function (data) {
      assert.equal(d3.select(this).text(), data.name + (data.dates.length > 0 ? " (" + data.dates.length + ")" : ""));
    });
  });

  /*it('should add as many circle as there is data.dates to each elements', function () {
    elements.each(function (data) {
      var circle = d3.select(this).selectAll('circle')[0];
      assert.equal(circle.length, data.dates.length);
    });
  });

  it('changing the scale should filter circle accordingly', function () {

    graph.xScale(
      d3.time.scale()
        .range([0, 10000])
        .domain([new Date(now - 1 * day), new Date(now)])
    );

    graph(elements);

    elements.each(function (data) {
      var circle = d3.select(this).selectAll('circle')[0];
      assert.equal(circle.length, filterData(data.dates, graph.xScale()).length);
    });

  });

  it ('no circle should be added if all value are outside range', function () {
    graph.xScale(
      d3.time.scale()
        .range([0, 10000])
        .domain([new Date(now - 5 * day), new Date(now - 4 * day)])
    );

    graph(elements);

    elements.each(function (data) {
      var circle = d3.select(this).selectAll('circle')[0];
      assert.equal(circle.length, 0);
    });
  });*/

});
