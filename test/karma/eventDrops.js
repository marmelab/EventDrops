import eventDrops from '../../lib/eventDrops';

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
        const zoom = require('../../lib/zoom');
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

    it('should call configuration.date function in onZoom', () => {
        const zoom = require('../../lib/zoom');
        const data = [ { name: 'bar', data: [{time: 1}, {time: 2}] }];
        const configuration = {
            date: () => new Date(),
            zoomable: false
        };
        spyOn(configuration, 'date').and.callThrough();

        // Initialize eventDrops to prepare graph elements for us.
        const element = d3.select(document.createElement('div'))
            .datum(data);
        eventDrops(configuration)(element);

        // Reset calls counter on `configuration.date` function after eventDrops initialization.
        configuration.date.calls.reset();

        // Manually initialize zoom function that is returned by `d3.zoom()`.
        const zoomFunc = zoom.default(element, undefined, {x: d3.scaleTime()}, configuration, data);

        // Make `requestAnimationFrame` call its callback immediately in this test.
        spyOn(window, 'requestAnimationFrame').and.callFake((callback) => callback());

        // Trigger zoom event on the element.
        element.call(zoomFunc)
            .call(zoomFunc.transform, d3.zoomIdentity);

        expect(configuration.date.calls.count()).toEqual(data[0].data.length);
        expect(configuration.date.calls.allArgs().map((arg) => arg[0])).toEqual(data[0].data);
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
});
