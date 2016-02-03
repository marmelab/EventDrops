require('../../lib/eventDrops');

describe('d3.chart.eventDrops', () => {
    it('should append a SVG element to given selection', () => {
        const div = document.createElement('div');
        const data = [{ name: 'foo', dates: [] }];

        const chart = d3.chart.eventDrops();
        d3.select(div).datum(data).call(chart);

        expect(div.querySelectorAll('svg.event-drops-chart').length).toBe(1);
    });

    it('should remove all previously created charts in current selection to prevent duplicates', () => {
        const div = document.createElement('div');
        const data = [{ name: 'foo', dates: [] }];

        const chart = d3.chart.eventDrops();
        d3.select(div).datum(data).call(chart);
        d3.select(div).datum(data).call(chart);

        expect(div.querySelectorAll('svg.event-drops-chart').length).toBe(1);
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
            { name: 'quz', dates: [] },
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
            { name: 'quz', dates: [new Date('2011-01-04'), new Date('2012-08-09')] },
        ];

        const chart = d3.chart.eventDrops().start(new Date('2010-01-25'));
        d3.select(div).datum(data).call(chart);

        expect(div.querySelectorAll('.drop').length).toBe(3);
    });

    it('should enable zoom only if `zoomable` configuration property is true', () => {
        const data = [ { name: 'foo', dates: [new Date()] }];
        const test = (zoomable, expectedZoomAreaNumber) => {
            const div = document.createElement('div');

            const chart = d3.chart.eventDrops().zoomable(zoomable);
            d3.select(div).datum(data).call(chart);

            expect(div.querySelectorAll('.zoom-area').length).toBe(expectedZoomAreaNumber);
        };

        test(false, 0);
        test(true, 1);
    });
});
