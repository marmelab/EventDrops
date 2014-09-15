"use strict";

describe('d3', function () {

  it('should add a timeline function to d3 that return a function', function () {
    expect(typeof d3.timeline).toBe('function');
    expect(typeof d3.timeline()).toBe('function');
  });

  describe('timeline', function () {
    var timeline;
    var element;

    beforeEach(function () {
      element = document.createElement('div')
      timeline = d3.timeline(element);
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
      expect(timeline.start().getTime()).toBe((new Date(0)).getTime());

      timeline.start(new Date(100));
      expect(timeline.start().getTime()).toBe((new Date(100)).getTime());
    });
  });

});
