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
});
// //
// //   it ('should have as many circle by name as timestamps', function () {
// //     elements.each(function (data) {
// //       var lines = d3.select(this).select('svg').selectAll('.line');
// //
// //       lines.each(function (data) {
// //         var circles = d3.select(this).selectAll('circle')[0];
// //         expect(circles.length).toBe(data.dates.length);
// //       });
// //     });
// //
// //     elements = elements.data([[{name: "field1", dates: [new Date(1402318080000), new Date(1402323060000), new Date(1402332120000)]}]]);
// //
// //     eventDrops(elements);
// //
// //     elements.each(function (data) {
// //       var lines = d3.select(this).select('svg').selectAll('.line');
// //       expect(data.length).toBe(1);
// //
// //       lines.each(function (data) {
// //         expect(data.dates.length).toBe(3);
// //         var circles = d3.select(this).selectAll('circle')[0];
// //         expect(circles.length).toBe(data.dates.length);
// //       });
// //     });
// //
// //   });
// //
// // });
