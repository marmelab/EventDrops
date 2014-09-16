"use strict";

describe('d3.eventDrops', function () {
  var eventDrops, parent, element;

  beforeEach(function () {
    parent = document.createElement('div');
    element = document.createElement('div');
    parent.appendChild(element);

    eventDrops = d3.eventDrops(element);
  });

  it('should add a eventDrops function to d3 that return a function', function () {
    expect(typeof d3.eventDrops).toBe('function');

    var parent = document.createElement('div');
    var element = document.createElement('div');
    parent.appendChild(element);

    expect(typeof d3.eventDrops(element)).toBe('function');
  });

  it ('should append only one svg element to the given element when called', function () {
    eventDrops();
    var svgs = element.getElementsByTagName('svg');
    expect(svgs.length).toBe(1);

    eventDrops();
    var svgs = element.getElementsByTagName('svg');
    expect(svgs.length).toBe(1);
  });

  it ('should have a configurable start', function () {
    expect(typeof eventDrops.start).toBe('function');
    expect(eventDrops.start().getTime()).toBe((new Date(0)).getTime());

    eventDrops.start(new Date());
    expect(eventDrops.start().getTime()).toBe((new Date()).getTime());
  });

  it ('should have as many line as eventType', function () {
    eventDrops();
    var svg, lines;

    eventDrops.data([{eventType: "field1", dates: []}, {eventType: "field2", dates: []}]);
    eventDrops();
    svg = element.getElementsByTagName('svg')[0];
    lines = svg.getElementsByClassName('line');

    expect(lines.length).toBe(2);

    eventDrops.data([{eventType: "field1", dates: []}]);
    eventDrops();
    svg = element.getElementsByTagName('svg')[0];
    lines = svg.getElementsByClassName('line');

    expect(lines.length).toBe(1);
  });

  it ('should have as many circle by eventType as timestamps', function () {
    var svg, line, circles;
    eventDrops.data([{eventType: "field1", dates: [new Date(1402318080000), new Date(1402323060000), new Date(1402332120000)]}]);
    eventDrops();
    svg = element.getElementsByTagName('svg')[0];
    line = svg.getElementsByClassName('line')[0];
    circles = line.getElementsByTagName('circle');
    expect(circles.length).toBe(3);

    eventDrops.start(new Date(1402323060000));
    eventDrops();

    svg = element.getElementsByTagName('svg')[0];
    line = svg.getElementsByClassName('line')[0];
    circles = line.getElementsByTagName('circle');
    expect(circles.length).toBe(2);

    eventDrops.end(new Date(1402323060000));
    eventDrops();

    line = svg.getElementsByClassName('line')[0];
    circles = line.getElementsByTagName('circle');
    expect(circles.length).toBe(1);
  });

  xit ('should display starting date', function () {
    var startDate = new Date(1402323060000);
    eventDrops.start(startDate);
    var startEl = document.getElementsByClassName('start');

    expect(startEl.textContent).toBe('YY-mm-dd');
  });

});
