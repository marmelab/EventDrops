"use strict";

describe('d3.timeline', function () {
  var timeline, parent, element;

  beforeEach(function () {
    parent = document.createElement('div');
    element = document.createElement('div');
    parent.appendChild(element);

    timeline = d3.timeline(element, {});
  });

  it('should add a timeline function to d3 that return a function', function () {
    expect(typeof d3.timeline).toBe('function');

    var parent = document.createElement('div');
    var element = document.createElement('div');
    parent.appendChild(element);

    expect(typeof d3.timeline(element)).toBe('function');
  });

  it ('should append only one svg element to the given element when called', function () {
    timeline();
    var svgs = element.getElementsByTagName('svg');
    expect(svgs.length).toBe(1);

    timeline();
    var svgs = element.getElementsByTagName('svg');
    expect(svgs.length).toBe(1);
  });

  it ('should have a configurable start', function () {
    expect(typeof timeline.start).toBe('function');
    expect(timeline.start().unix()).toBe(moment(0).unix());

    timeline.start(moment(100));
    expect(timeline.start().unix()).toBe(moment(100).unix());
  });

  it ('should have as many line as eventType', function () {
    var svg, lines;

    timeline.data([{eventType: "field1", timestamps: []}, {eventType: "field2", timestamps: []}]);
    timeline();
    svg = element.getElementsByTagName('svg')[0];
    lines = svg.getElementsByClassName('line');

    expect(lines.length).toBe(2);

    timeline.data([{eventType: "field1", timestamps: []}]);
    timeline();
    svg = element.getElementsByTagName('svg')[0];
    lines = svg.getElementsByClassName('line');

    expect(lines.length).toBe(1);
  });

  it ('should have as many circle by eventType as timestamps', function () {
    var svg, line, circles;
    timeline.data([{eventType: "field1", timestamps: [1402318080,1402323060,1402332120]}]);
    timeline();
    svg = element.getElementsByTagName('svg')[0];
    line = svg.getElementsByClassName('line')[0];
    circles = line.getElementsByTagName('circle');
    expect(circles.length).toBe(3);

    timeline.start(new Date(1402323060000));
    timeline();

    line = svg.getElementsByClassName('line')[0];
    circles = line.getElementsByTagName('circle');
    expect(circles.length).toBe(2);

    timeline.end(new Date(1402323060000));
    timeline();

    line = svg.getElementsByClassName('line')[0];
    circles = line.getElementsByTagName('circle');
    expect(circles.length).toBe(1);
  });

  it ('should display starting date', function () {
    var startDate = moment(1402323060000);
    timeline.start(startDate);
    var startEl = document.getElementsByClassName('start');

    expect(startEl.textContent).toBe(startDate.format('YY-mm-dd'));
  });

});
