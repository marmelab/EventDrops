"use strict";

describe('eventLine', function () {
  var graph, elements;

  beforeEach(function () {
    graph = d3.chart.eventLine();
    graph.xScale(d3.time.scale()
      .range([0, 1000])
      .domain([new Date(0), new Date(1000)]));
    var svg = document.createElement('svg');
    elements = d3.select(svg).selectAll('g').data([{name: 'nom1', dates: []}, {name: 'nom2', dates: [new Date(0)]}, {name: 'nom3', dates: [new Date(0), new Date(10)]}]).enter().append('g');
    graph(elements);
  });

  it('should add a text with data.name and number of dates if any to all its elements', function () {
    var texts = elements.selectAll('text');

    expect(texts.length).toBe(3);

    texts.each(function (data) {
      expect(d3.select(this).text()).toBe(data.name + (data.dates.length > 0 ? " (" + data.dates.length + ")" : ""));
    });
  });

  it('should add as many circle as there is data.dates to each elements', function () {
    elements.each(function (data) {
      var circle = d3.select(this).selectAll('circle')[0];
      expect(circle.length).toBe(data.dates.length);
    });

  });
});
