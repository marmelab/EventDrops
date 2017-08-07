import eventDrops from '../../src';

describe('eventDrops', () => {
    it('should append a SVG element to given selection', () => {
        const div = document.createElement('div');
        const data = [{ name: 'foo', data: [] }];

        const chart = eventDrops();
        d3.select(div).datum(data).call(chart);

        expect(div.querySelectorAll('svg.event-drops-chart').length).toBe(1);
    });

    it('should remove all previously created charts in current selection to prevent duplicates', () => {
        const div = document.createElement('div');
        const data = [{ name: 'foo', data: [] }];

        const chart = eventDrops();
        d3.select(div).datum(data).call(chart);
        d3.select(div).datum(data).call(chart);

        expect(div.querySelectorAll('svg.event-drops-chart').length).toBe(1);
    });

    describe('start period', () => {
        it('should be configurable', () => {
            const div = document.createElement('div');
            const data = [{ name: 'foo', data: [] }];

            const chart = eventDrops().start(new Date('2010-01-25'));
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

        const chart = eventDrops().start(new Date('2010-01-25'));
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

        const chart = eventDrops().start(new Date('2010-01-25'));
        d3.select(div).datum(data).call(chart);

        expect(div.querySelectorAll('.drop').length).toBe(3);
    });

    it('should enable zoom only if `zoomable` configuration property is true', () => {
        const zoom = require('../../src/zoom');
        const data = [ { name: 'foo', data: [new Date()] }];

        spyOn(zoom, 'default').and.callThrough();

        const test = (zoomable, expectedZoomableBehavior) => {
            zoom.default.calls.reset();
            const div = document.createElement('div');

            const chart = eventDrops().zoomable(zoomable);
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

        const chart = eventDrops().date(d => d.date).start(new Date('2010-01-25'));
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

        const chart = eventDrops()
            .labelsWidth(50)
            .labelsRightMargin(10);

        d3.select(div).datum(data).call(chart);
        expect(div.querySelector('.chart-wrapper').attributes.transform.value).toBe('translate(60, 55)');
    });

    it('should expose its scales via scale property', () => {
        const div = global.document.createElement('div');
        const data = [
            { name: 'foo', data: [{ date: new Date('2010-01-01'), foo: 'bar1' }] },
        ];

        const configuredEventDrops = eventDrops()
            .start(new Date(new Date().getTime() - (3600000 * 24 * 365))) // one year ago
            .end(new Date())
            .date(d => new Date(d.date));

        const chart = d3.select(div).datum(data).call(configuredEventDrops);
        const scales = chart.scales;

        expect(scales.x).not.toBe(null);
        expect(scales.y).not.toBe(null);
    });

    it('should expose a "visibleDataInRow" function to get viewport visible data', () => {
        const div = global.document.createElement('div');
        const dataSet = [{
            name: 'foo',
            data: [
                { date: new Date('2016-04-04') },
                { date: new Date('2016-04-05') },
                { date: new Date('2016-04-06') },
                { date: new Date('2016-04-07') },
                { date: new Date('2016-04-08') },
            ],
        }];

        // display data between yesterday and tomorrow
        const configuredEventDrops = eventDrops()
            .start(new Date('2016-04-05'))
            .end(new Date('2016-04-07'))
            .date(d => d.date);

        const chart = d3.select(div).datum(dataSet).call(configuredEventDrops);

        const visibleDatas = chart.visibleDataInRow(dataSet[0].data, chart.scales.x);
        expect(visibleDatas).toEqual([
            { date: new Date('2016-04-05') },
            { date: new Date('2016-04-06') },
            { date: new Date('2016-04-07') },
        ]);
    });
});
