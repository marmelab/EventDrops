"use strict";

describe('d3.chart.eventDrop', function () {
  var eventDrop, elements;

  beforeEach(function () {
    var body = d3.select(document.createElement('body'));
    elements = body
      .selectAll('div')
      .data([[{name: "field1", dates: []}, {name: "field2", dates: []}], [{name: "field1", dates: []}, {name: "field2", dates: []}]])
    ;
    elements
      .enter()
      .append('div')
    ;

    elements.exit().remove();

    eventDrop = d3.chart.eventDrop();

    eventDrop(elements);
  });

  it('should add a eventDrop function to d3 that return a function', function () {
    expect(typeof d3.chart.eventDrop).toBe('function');

    expect(typeof d3.chart.eventDrop()).toBe('function');
  });

  it ('should append one svg element to the given elements or replace it when called', function () {
    elements.each(function (data) {
      var svgs = d3.select(this).selectAll('svg')[0];
      expect(svgs.length).toBe(1);
    });

    eventDrop(elements);

    elements.each(function (data) {
      var svgs = d3.select(this).selectAll('svg')[0];
      expect(svgs.length).toBe(1);
    });
  });

  it ('should have a configurable start', function () {
    expect(typeof eventDrop.start).toBe('function');
    expect(eventDrop.start().getTime()).toBe((new Date(0)).getTime());

    eventDrop.start(new Date());
    expect(eventDrop.start().getTime()).toBe((new Date()).getTime());
  });

  it ('should have as many line as event', function () {
    elements.each(function (data) {
      var svg = d3.select(this).select('svg');
      var lines = svg.selectAll('.line')[0];

      expect(lines.length).toBe(2);
    });

    elements = elements.data([[{name: "field1", dates: []}]]);

    eventDrop(elements);

    elements.each(function (data) {
      var svg = d3.select(this).select('svg');
      var lines = svg.selectAll('.line')[0];

      expect(lines.length).toBe(1);
    });

  });

  it ('should have as many circle by name as timestamps', function () {
    elements.each(function (data) {
      var lines = d3.select(this).select('svg').selectAll('.line');

      lines.each(function (data) {
        var circles = d3.select(this).selectAll('circle')[0];
        expect(circles.length).toBe(data.dates.length);
      });
    });

    elements = elements.data([[{name: "field1", dates: [new Date(1402318080000), new Date(1402323060000), new Date(1402332120000)]}]]);

    eventDrop(elements);

    elements.each(function (data) {
      var lines = d3.select(this).select('svg').selectAll('.line');
      expect(data.length).toBe(1);

      lines.each(function (data) {
        expect(data.dates.length).toBe(3);
        var circles = d3.select(this).selectAll('circle')[0];
        expect(circles.length).toBe(data.dates.length);
      });
    });

  });

});
