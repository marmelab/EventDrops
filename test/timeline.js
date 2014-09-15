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

});
