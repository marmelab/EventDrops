require('../../lib/eventDrops');

describe('d3.chart.eventDrops', () => {
    it('should append a SVG element to given selection', () => {
        const div = document.createElement('div');
        const data = [{ name: 'foo', data: [] }];

        const chart = d3.chart.eventDrops();
        d3.select(div).datum(data).call(chart);

        expect(div.querySelectorAll('svg.event-drops-chart').length).toBe(1);
    });

    it('should remove all previously created charts in current selection to prevent duplicates', () => {
        const div = document.createElement('div');
        const data = [{ name: 'foo', data: [] }];

        const chart = d3.chart.eventDrops();
        d3.select(div).datum(data).call(chart);
        d3.select(div).datum(data).call(chart);

        expect(div.querySelectorAll('svg.event-drops-chart').length).toBe(1);
    });

    describe('start period', () => {
        it('should be configurable', () => {
            const div = document.createElement('div');
            const data = [{ name: 'foo', data: [] }];

            const chart = d3.chart.eventDrops().start(new Date('2010-01-25'));
            d3.select(div).datum(data).call(chart);

            expect(div.querySelector('.extremum .minimum').textContent).toBe('25 January 2010');
        });
    });

    it('should have as many lines as events', () => {
        const div = document.createElement('div');
        const data = [
            { name: 'foo', data: [] },
            { name: 'bar', data: [] },
            { name: 'quz', data: [] },
        ];

        const chart = d3.chart.eventDrops().start(new Date('2010-01-25'));
        d3.select(div).datum(data).call(chart);

        expect(div.querySelectorAll('.drop-line').length).toBe(3);
    });

    it('should have as many drops as given dates', () => {
        const div = document.createElement('div');
        const data = [
            { name: 'foo', data: [new Date('2010-01-01')] },
            { name: 'bar', data: [] },
            { name: 'quz', data: [new Date('2011-01-04'), new Date('2012-08-09')] },
        ];

        const chart = d3.chart.eventDrops().start(new Date('2010-01-25'));
        d3.select(div).datum(data).call(chart);

        expect(div.querySelectorAll('.drop').length).toBe(3);
    });

    it('should enable zoom only if `zoomable` configuration property is true', () => {
        const zoom = require('../../lib/zoom');
        const data = [ { name: 'foo', data: [new Date()] }];

        const test = (zoomable, expectedZoomableBehavior) => {
            zoom.default = jasmine.createSpy();

            const div = document.createElement('div');

            const chart = d3.chart.eventDrops().zoomable(zoomable);
            d3.select(div).datum(data).call(chart);

            expect(zoom.default.calls.any()).toBe(expectedZoomableBehavior);
        };

        test(false, false);
        test(true, true);
    });

    it('should be possible to supply objects as data', () => {
        const div = document.createElement('div');
        const data = [
            { name: 'foo', data: [{date: new Date('2010-01-01'), foo: 'bar1'}]},
            { name: 'bar', data: [] },
            { name: 'quz', data: [{date: new Date('2011-01-04'), foo: 'bar2'},
                                {date: new Date('2012-08-09'), foo: 'bar3'}]}];

        const chart = d3.chart.eventDrops().date(d => d.date).start(new Date('2010-01-25'));
        d3.select(div).datum(data).call(chart);

        expect(div.querySelectorAll('.drop').length).toBe(3);
    });

    it('should set up drops lines container correctly relatively to labels column', () => {
        const div = document.createElement('div');
        const data = [{
            name: 'foo',
            data: [
                { date: new Date('2010-01-01'), foo: 'bar' },
            ],
        }];

        const chart = d3.chart.eventDrops()
            .labelsWidth(50)
            .labelsRightMargin(10);

        d3.select(div).datum(data).call(chart);
        expect(div.querySelector('.chart-wrapper').attributes.transform.value).toBe('translate(60, 55)');
    });
});
