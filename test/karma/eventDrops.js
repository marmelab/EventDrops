require('../../lib/eventDrops');

describe('d3.chart.eventDrops', () => {
    it('should append a SVG element to given selection', () => {
        const div = document.createElement('div');
        const data = [{ name: 'foo', dates: [] }];

        const chart = d3.chart.eventDrops();
        d3.select(div).datum(data).call(chart);

        expect(div.querySelectorAll('svg').length).toBe(1);
    });

    describe('start period', () => {
        it('should be configurable', () => {
            const div = document.createElement('div');
            const data = [{ name: 'foo', dates: [] }];

            const chart = d3.chart.eventDrops().start(new Date('2010-01-25'));
            d3.select(div).datum(data).call(chart);

            expect(div.querySelector('.extremum .minimum').textContent).toBe('25 January 2010');
        });
    });

    it('should have as many lines as events', () => {
        const div = document.createElement('div');
        const data = [
            { name: 'foo', dates: [] },
            { name: 'bar', dates: [] },
            { name: 'quz', dates: [] }
        ];

        const chart = d3.chart.eventDrops().start(new Date('2010-01-25'));
        d3.select(div).datum(data).call(chart);

        expect(div.querySelectorAll('.drop-line').length).toBe(3);
    });

    it('should have as many drops as given dates', () => {
        const div = document.createElement('div');
        const data = [
            { name: 'foo', dates: [new Date('2010-01-01')] },
            { name: 'bar', dates: [] },
            { name: 'quz', dates: [new Date('2011-01-04'), new Date('2012-08-09')] }
        ];

        const chart = d3.chart.eventDrops().start(new Date('2010-01-25'));
        d3.select(div).datum(data).call(chart);

        expect(div.querySelectorAll('.drop').length).toBe(3);
    });

    /**
    "use strict";
    var d3 = require('d3');
    var assert = require('assert');
    var document = require('jsdom').jsdom();

    var filterData = require('../../lib/filterData');
    var eventDrops = require('../../lib/eventDrops');

    describe('eventDrops', function () {
      var graph, elements;

      var day = 1000 * 60 * 60 * 24;
      var now = Date.now();

      beforeEach(function () {
        graph = eventDrops({hasBottomAxis: true});
        var body = document.createElement('body');
        elements = d3.select(body).selectAll('div')
          .data([[
            {name: 'nom1', dates: []},
            {name: 'nom2', dates: [new Date(now - 2 * day)]},
            {name: 'nom3', dates: [new Date(now - 1 * day), new Date(now)]}
          ]])
          .enter().append('div')
        ;

        graph(elements);
      });

      it ('should add a xscale to each element', function () {
        elements.each(function () {
          var axisTop = d3.select(this).selectAll('.x-axis.top')[0];
          assert.equal(axisTop.length, 1);
          var axisBottom = d3.select(this).selectAll('.x-axis.bottom')[0];
          assert.equal(axisBottom.length, 1);
        });
      });

      it ('should add a yscale to each element with as many line(tick) as event', function () {
        elements.each(function () {
          var yAxis = d3.select(this).selectAll('.y-axis');
          assert.equal(yAxis.length, 1);

          var lines = yAxis.selectAll('line')[0];

          assert.equal(lines.length, 3);
        });
      });

      it ('should add a zoom rect to each element', function () {
        elements.each(function (data) {
          var zoom = d3.select(this).selectAll('.zoom');
          assert.equal(zoom[0].length, 1);
          var margin = graph.margin();
          assert.equal(zoom.attr('width'), graph.width() - margin.left - margin.right);
          assert.equal(zoom.attr('height'), (data.length * 40) + margin.top + margin.bottom);
        });
      });

      

    });

**/
});
